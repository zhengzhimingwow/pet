if (onlineMode) {
 const entry = $('account-entry');
 const lobby = $('account-lobby');
 const townStage = $('town-stage');
 const battleView = $('town-battle-view');
 const townFeedback = $('town-feedback');
 const backToSquare = $('back-lobby');
 const accountFeedback = $('account-feedback');
 const loginForm = $('online-login');
 const townHistory = $('town-battle-history');
 const damageDialog = $('town-damage-dialog');
 const weaponDialog = $('town-weapon-dialog');
 const weaponList = $('town-weapon-list');
 const weaponFeedback = $('town-weapon-feedback');
 const opponentsList = $('town-opponents');
 const opponentsEmpty = $('town-opponents-empty');
 const refreshOpponentsButton = $('refresh-opponents');
 const zoneGroups = $('zone-groups');
 const zoneOptions = $('zone-options');
 const zoneEnter = $('zone-enter');
 const savedAccount = $('saved-account');
 const zonesPerGroup = 10;
 const historyTimeFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit',
  hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23',
 });
 let account;
 let session;
 let selectedZone;
 let registering = false;
 let busy = false;
 let pending;
 let lastReport;
 let returnToSquareTimer;
 let damageReportButton;

 const messages = {
  unauthorized: '登录已失效，请重新登录。',
  invalid_credentials: '账号或密码有误，请检查后重试。',
  invalid_registration: '请使用 3–32 位字母、数字或下划线作为账号。',
  account_taken: '这个账号已被注册，可以直接登录或换一个账号。',
  remember_expired: '这个账号的免密登录已过期，请输入密码重新登录。',
  zone_not_entered: '请先选择区服。',
  rate_limited: '登录尝试较多，请稍后重试。',
  not_found: '没有找到该角色或战报。',
  same_player: '请选择其他玩家。',
  invalid_request: '请检查区服和角色 UID。',
  request_conflict: '请求编号已被使用，请重新选择对手。',
  weapon_locked: '尚未获得这把武器。',
  unavailable: '区服或战斗服暂时不可用，请稍后重试。',
 };

 async function api(zone, path, body) {
  const prefix = zone ? `api/zone/${zone}` : 'api/account';
  const response = await fetch(`${prefix}${path}`, {
   method: body ? 'POST' : 'GET',
   headers: body ? {'Content-Type': 'application/json'} : {},
   body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 429) throw new Error(messages.rate_limited);
  const data = await response.json();
  if (!response.ok) {
   const error = new Error(messages[data.error] ?? messages.unavailable);
   error.code = data.error;
   throw error;
  }
  return data;
 }

 function showEntry() {
  clearTimeout(returnToSquareTimer);
  battleView.hidden = true;
  townStage.hidden = false;
  entry.hidden = Boolean(session);
  $('account-login').hidden = Boolean(account);
  const choosingZone = Boolean(account && !session);
  $('account-zones').hidden = !choosingZone;
  entry.classList.toggle('choosing-zone', choosingZone);
  lobby.hidden = !session;
 }

 function selectZone(zone) {
  selectedZone = zone;
  $('zone-selection').textContent = zone ? `已选 ${zone.name}` : '';
  zoneEnter.disabled = busy || !zone;
  for (const button of zoneOptions.querySelectorAll('button')) {
   button.setAttribute('aria-pressed', String(Number(button.dataset.zone) === zone?.id));
  }
 }

 function renderZoneGroup(group, zones) {
  for (const button of zoneGroups.querySelectorAll('button')) {
   button.setAttribute('aria-pressed', String(Number(button.dataset.group) === group));
  }
  $('zone-group-title').textContent = group ? `${group}–${group + zonesPerGroup - 1} 服` : '区服列表';
  $('zone-count').textContent = zones.length ? `${zones.length} 个区服` : '';
  $('zone-empty').hidden = Boolean(zones.length);
  zoneOptions.replaceChildren(...zones.map(zone => {
   const row = document.createElement('li');
   const button = document.createElement('button');
   const name = document.createElement('span');
   const indicator = document.createElement('span');
   button.type = 'button';
   button.className = 'zone-row';
   button.dataset.zone = zone.id;
   button.disabled = busy;
   name.textContent = zone.name;
   indicator.className = 'zone-indicator';
   indicator.setAttribute('aria-hidden', 'true');
   button.append(name, indicator);
   button.addEventListener('click', () => selectZone(zone));
   row.append(button);
   return row;
  }));
  selectZone(zones.find(zone => zone.id === selectedZone?.id) ?? zones[0]);
 }

 async function showZones() {
  const {zones} = await api(null, '/zones');
  session = pending = lastReport = null;
  townHistory.replaceChildren();
  opponentsList.replaceChildren();
  $('zone-account-name').textContent = account.username;
  const groups = new Map();
  for (const zone of [...zones].sort((a, b) => a.id - b.id)) {
   const group = Math.floor((zone.id - 1) / zonesPerGroup) * zonesPerGroup + 1;
   if (!groups.has(group)) groups.set(group, []);
   groups.get(group).push(zone);
  }
  zoneGroups.replaceChildren(...[...groups].map(([group, members]) => {
   const button = document.createElement('button');
   button.type = 'button';
   button.className = 'zone-group-button';
   button.dataset.group = group;
   button.disabled = busy;
   button.textContent = `${group}–${group + zonesPerGroup - 1} 服`;
   button.addEventListener('click', () => renderZoneGroup(group, members));
   return button;
  }));
  const previousGroup = [...groups].find(([, members]) => members.some(zone => zone.id === selectedZone?.id));
  const [group, members] = previousGroup ?? groups.entries().next().value ?? [null, []];
  renderZoneGroup(group, members);
  showEntry();
  $('zone-title').focus();
 }

 zoneEnter.addEventListener('click', () => run(async () => {
  if (!selectedZone) return;
  acceptSession(await api(selectedZone.id, '/enter', {}));
  $('town-title').focus();
  await Promise.all([refreshOpponents(), refreshHistory()]);
 }));

 function acceptSession(data) {
  renderPlayer(data);
  townFeedback.textContent = '';
  $('town-history-empty').hidden = true;
  opponentsEmpty.hidden = true;
  opponentsList.replaceChildren();
  showEntry();
 }

 function renderPlayer(data) {
  session = data;
  const {player, zone, progression} = data;
  const weapon = weaponMoves[player.weapon_id];
  $('town-zone').textContent = `${zone} 服`;
  $('town-player-name').textContent = player.name;
  $('online-player').textContent = `UID ${player.player_id}`;
  $('town-hp').textContent = player.max_hp;
  $('town-attack').textContent = player.attack;
  $('town-defense').textContent = player.defense;
  $('town-weapon').textContent = weapon?.label ?? '未装备';
  $('town-weapon-icon').textContent = weapon?.icon || (weapon ? '⚔' : '–');
  $('town-skill').textContent = player.skill_id === 'combo' ? '连击' : '未装备';
  $('town-level').textContent = `Lv. ${progression.level}`;
  $('town-xp').max = progression.next_level_xp;
  $('town-xp').value = progression.xp;
  $('town-xp-text').textContent = `${progression.xp} / ${progression.next_level_xp} 经验`;
  if (weaponDialog.open) renderWeaponCollection();
 }

 function renderWeaponCollection() {
  const owned = new Set(session.progression.weapons);
  const catalog = Object.entries(weaponMoves);
  $('town-weapon-count').textContent = `已收集 ${owned.size} / ${catalog.length} · 每次升级随机获得一把未拥有的武器`;
  weaponList.replaceChildren(...catalog.map(([id, move]) => {
   const item = document.createElement('li');
   const hasWeapon = owned.has(id);
   const equipped = session.player.weapon_id === id;
   const icon = document.createElement('span');
   icon.className = 'town-item-icon';
   icon.textContent = move.icon || '⚔';
   icon.setAttribute('aria-hidden', 'true');
   const info = document.createElement('div');
   const label = document.createElement('strong');
   label.textContent = move.label;
   const detail = document.createElement('small');
   detail.textContent = `${move.range === 'ranged' ? '远程' : '近战'} · ${move.name}`;
   info.append(label, detail);
   item.append(icon, info);
   if (hasWeapon && !equipped) {
    const equip = document.createElement('button');
    equip.type = 'button';
    equip.textContent = '装备';
    equip.setAttribute('aria-label', `装备${move.label}`);
    equip.disabled = busy;
    equip.addEventListener('click', () => run(async () => {
     weaponFeedback.textContent = '';
     try {
      renderPlayer(await api(session.zone, '/equipment', {weapon_id:id}));
      weaponFeedback.textContent = `已装备${move.label}`;
      weaponDialog.querySelector('[autofocus]').focus({preventScroll:true});
     } catch (error) {
      if (error.code === 'unauthorized') {
       weaponDialog.close();
       throw error;
      }
      weaponFeedback.textContent = error.code ? error.message : messages.unavailable;
     }
    }));
    item.append(equip);
   } else {
    const state = document.createElement('span');
    state.className = equipped ? 'weapon-equipped' : 'weapon-locked';
    state.textContent = equipped ? '已装备' : '未获得';
    item.append(state);
   }
   return item;
  }));
 }
 $('open-weapon-collection').addEventListener('click', () => {
  weaponFeedback.textContent = '';
  renderWeaponCollection();
  weaponDialog.showModal();
 });

 function lock(value) {
  busy = value;
  $('login-submit').disabled = value;
  refreshOpponentsButton.disabled = value;
  $('online-logout').disabled = value;
  $('zone-logout').disabled = value;
  $('switch-zone').disabled = value;
  $('toggle-register').disabled = value;
  savedAccount.disabled = value;
  $('saved-login').disabled = value;
  $('saved-forget').disabled = value;
  backToSquare.disabled = value;
  $('open-weapon-collection').disabled = value;
  for (const button of weaponList.querySelectorAll('button')) button.disabled = value;
  for (const button of townHistory.querySelectorAll('button')) button.disabled = value;
  for (const button of opponentsList.querySelectorAll('button')) button.disabled = value;
  for (const button of zoneOptions.querySelectorAll('button')) button.disabled = value;
  for (const button of zoneGroups.querySelectorAll('button')) button.disabled = value;
  zoneEnter.disabled = value || !selectedZone;
 }

 function damageBySource(events) {
  const totals = new Map();
  for (const event of events) {
   if (event.kind !== 'hit') continue;
   const key = `${event.actor}:${event.source_type}:${event.source_id}`;
   const total = totals.get(key) ?? {actor:event.actor, name:event.source_name, damage:0};
   total.damage += event.applied_damage;
   totals.set(key, total);
  }
  return [...totals.values()];
 }

 function battleTurns(report) {
  const turns = [];
  for (const event of report.events) {
   const number = report.rules_version === 1 ? Math.ceil(event.round / 2) : event.round;
   let turn = turns.at(-1);
   if (turn?.number !== number || turn.attacker !== event.actor) {
    turn = {
     number, attacker:event.actor, defender:event.target,
     move:weaponMoves[event.move_id] ?? punch, dodge:event.kind === 'dodge',
     damage:0, remainingHp:event.remaining_hp, events:[],
    };
    turns.push(turn);
   }
   turn.events.push(event);
   turn.damage += event.applied_damage;
   turn.remainingHp = event.remaining_hp;
  }
  return turns;
 }

 async function playback(report, rewardText) {
  clearTimeout(returnToSquareTimer);
  townStage.hidden = true;
  battleView.hidden = false;
  $('arena-title').focus({preventScroll:true});
  battleView.scrollIntoView({block:'nearest'});
  lastReport = report;
  await playBattle({
   turns:battleTurns(report), hp:{left:report.left_hp, right:report.right_hp}, winner:report.winner,
   players:{left:report.attacker, right:report.defender}, damageTotals:damageBySource(report.events), rewardText,
  });
  returnToSquareTimer = setTimeout(returnToSquare, 3000);
 }

 function showDamageReport(report, time, opener) {
  const names = {left:report.attacker.name, right:report.defender.name};
  if (names.left === names.right) {
   names.left += '（先手）';
   names.right += '（后手）';
  }
  const outcome = report.winner === 'draw' ? '平局' : `${names[report.winner]}获胜`;
  $('town-damage-match').textContent = `${names.left} 对战 ${names.right} · ${outcome} · ${time}`;

  const totals = damageBySource(report.events);
  const summary = $('town-damage-summary');
  summary.replaceChildren();
  for (const [side, name] of Object.entries(names)) {
   const sources = totals.filter(total => total.actor === side);
   const card = document.createElement('section');
   const title = document.createElement('h4');
   title.textContent = `${name} · 实际伤害 ${sources.reduce((sum, source) => sum + source.damage, 0)}`;
   const list = document.createElement('ul');
   for (const source of sources) {
    const item = document.createElement('li');
    item.textContent = `${source.name} · ${source.damage} 点`;
    list.append(item);
   }
   card.append(title, list);
   summary.append(card);
  }

  const rounds = $('town-damage-rounds');
  rounds.replaceChildren();
  let roundNumber;
  let roundActions;
  const turns = battleTurns(report);
  for (const turn of turns) {
   if (roundNumber !== turn.number) {
    roundNumber = turn.number;
    const round = document.createElement('li');
    const title = document.createElement('h4');
    title.textContent = `第 ${roundNumber} 回合`;
    roundActions = document.createElement('div');
    round.append(title, roundActions);
    rounds.append(round);
   }
   const title = document.createElement('h5');
   title.textContent = `${names[turn.attacker]}出手`;
   const events = document.createElement('ul');
   for (const event of turn.events) {
    const item = document.createElement('li');
    const defender = names[event.target];
    const move = `${event.source_name} · ${event.move_name}`;
    if (event.kind === 'dodge') {
     item.textContent = `使用「${move}」，被 ${defender} 闪避。`;
    } else if (event.kind === 'knockout') {
     item.textContent = `${defender} 倒下了。`;
    } else {
     const calculated = event.damage !== event.applied_damage ? `（计算伤害 ${event.damage}）` : '';
     const critical = event.critical ? '（暴击）' : '';
     const action = event.source_id === 'combo' ? '追加连击' : '出招';
     item.textContent = `${action}「${move}」${critical}，${defender} 扣血 ${event.applied_damage}${calculated}，剩余生命 ${event.remaining_hp}。`;
    }
    events.append(item);
   }
   roundActions.append(title, events);
  }
  const lastTurn = turns.at(-1);
  if (lastTurn?.attacker === 'left') {
   const note = document.createElement('p');
   note.textContent = `${names[lastTurn.defender]}未出手，本回合未打完。`;
   roundActions.append(note);
  }

  damageReportButton = opener;
  damageDialog.showModal();
  damageDialog.querySelector('.town-damage-content').scrollTop = 0;
 }

 damageDialog.addEventListener('close', () => {
  damageReportButton?.focus({preventScroll:true});
 });

 async function refreshHistory() {
  const {battles} = await api(session.zone, '/battles');
  townHistory.replaceChildren();
  $('town-history-empty').hidden = Boolean(battles.length);
  for (const report of battles) {
   const item = document.createElement('li');
   const playButton = document.createElement('button');
   const reportButton = document.createElement('button');
   const actions = document.createElement('div');
   const info = document.createElement('div');
   const details = document.createElement('span');
   const name = document.createElement('span');
   const time = document.createElement('time');
   const result = document.createElement('span');
   info.className = 'town-history-info';
   actions.className = 'town-history-actions';
   details.className = 'town-history-details';
   name.textContent = report.opponent;
   const playedAt = new Date(Number(report.created_at_epoch) * 1000);
   if (Number.isFinite(playedAt.getTime())) {
    time.dateTime = playedAt.toISOString();
    time.textContent = historyTimeFormat.format(playedAt);
   } else {
    time.textContent = report.created_at.slice(0, 19);
   }
   details.append(name, time);
   result.className = `town-outcome town-outcome-${report.winner}`;
   result.textContent = {left:'胜', right:'负', draw:'平'}[report.winner];
   info.append(details, result);
   const matchLabel = `${report.opponent}，${time.textContent}`;
   const path = `/battles/${report.battle_id}`;
   playButton.type = 'button';
   playButton.disabled = busy;
   playButton.textContent = '播放';
   playButton.setAttribute('aria-label', `播放，${matchLabel}`);
   playButton.addEventListener('click', () => run(async () => playback(await api(session.zone, path))));
   reportButton.type = 'button';
   reportButton.disabled = busy;
   reportButton.textContent = '文字战报';
   reportButton.setAttribute('aria-label', `文字战报，${matchLabel}`);
   reportButton.addEventListener('click', () => run(async () => {
    const battle = await api(session.zone, path);
    showDamageReport(battle, time.textContent, reportButton);
   }));
   actions.append(reportButton, playButton);
   item.append(info, actions);
   townHistory.append(item);
  }
 }

 async function refreshOpponents() {
  const {opponents} = await api(session.zone, '/opponents');
  opponentsList.replaceChildren(...opponents.map(player => {
   const row = document.createElement('li');
   const avatar = document.createElement('span');
   const details = document.createElement('span');
   const name = document.createElement('strong');
   const uid = document.createElement('small');
   const button = document.createElement('button');
   avatar.className = 'avatar';
   avatar.setAttribute('aria-hidden', 'true');
   details.className = 'town-opponent-details';
   name.textContent = player.name;
   uid.textContent = `UID ${player.player_id}`;
   details.append(name, uid);
   button.type = 'button';
   button.disabled = busy;
   button.textContent = '挑战';
   button.setAttribute('aria-label', `挑战 ${player.name}，UID ${player.player_id}`);
   button.addEventListener('click', () => run(() => challenge(player.player_id)));
   row.append(avatar, details, button);
   return row;
  }));
  opponentsEmpty.hidden = opponents.length > 0;
 }

 async function run(action) {
  if (busy) return;
  lock(true);
  const status = lobby.hidden ? accountFeedback : townFeedback;
  status.textContent = '';
  try {
   await action();
  } catch (error) {
   if (error.code === 'unauthorized') {
    account = session = pending = lastReport = null;
    selectedZone = null;
    setRegistration(false);
    showEntry();
    accountFeedback.textContent = messages.unauthorized;
    await refreshSavedAccounts().catch(() => {});
   } else {
    const activeStatus = lobby.hidden ? accountFeedback : townFeedback;
    activeStatus.textContent = error instanceof SyntaxError || error instanceof TypeError ? messages.unavailable : error.message;
   }
  } finally {
   lock(false);
  }
 }

 const password = $('login-password');
 const confirmation = $('confirm-password');
 const username = $('login-account');
 const visibility = $('password-visibility');

 async function refreshSavedAccounts() {
  const {accounts} = await api(null, '/remembered');
  const previous = savedAccount.value;
  savedAccount.replaceChildren(...accounts.map(name => new Option(name, name)));
  if (accounts.includes(previous)) savedAccount.value = previous;
  $('saved-account-panel').hidden = registering || !accounts.length;
 }

 async function finishLogin(data) {
  account = data;
  username.value = data.username;
  setRegistration(false);
  try {
   await showZones();
  } catch (error) {
   account = null;
   throw error;
  }
  accountFeedback.textContent = '';
 }

 $('saved-login').addEventListener('click', () => run(async () => {
  const selected = savedAccount.value;
  try {
   await finishLogin(await api(null, '/remembered/login', {username:selected}));
  } catch (error) {
   if (error.code === 'remember_expired') {
    username.value = selected;
    await refreshSavedAccounts();
    password.focus();
   }
   throw error;
  }
 }));
 $('saved-forget').addEventListener('click', () => run(async () => {
  await api(null, '/remembered/forget', {username:savedAccount.value});
  await refreshSavedAccounts();
 }));
 function showPassword(visible) {
  password.type = visible ? 'text' : 'password';
  visibility.textContent = visible ? '隐藏' : '显示';
  visibility.setAttribute('aria-label', visible ? '隐藏密码' : '显示密码');
  visibility.setAttribute('aria-pressed', String(visible));
 }

 function setRegistration(value) {
  registering = value;
  $('login-title').textContent = value ? '注册账号' : '欢迎回家';
  $('login-copy').textContent = value
   ? '创建账号，开始你的企鹅小镇之旅。'
   : '登录账号后，选择你要进入的区服。';
  $('login-submit-label').textContent = value ? '注册并登录' : '登录游戏';
  $('toggle-register').textContent = value ? '返回登录' : '注册账号';
  $('confirm-field').hidden = !value;
  $('saved-account-panel').hidden = value || !savedAccount.options.length;
  confirmation.disabled = !value;
  confirmation.required = value;
  username.minLength = value ? 3 : 1;
  username.placeholder = value ? '3–32 位字母、数字或下划线' : '请输入账号';
  password.placeholder = value ? '请设置密码' : '请输入密码';
  password.autocomplete = value ? 'new-password' : 'current-password';
  password.value = confirmation.value = '';
  showPassword(false);
 }

 $('toggle-register').addEventListener('click', () => {
  setRegistration(!registering);
  accountFeedback.textContent = '';
  username.focus();
 });
 visibility.addEventListener('click', () => showPassword(password.type === 'password'));
 loginForm.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
   if (registering && password.value !== confirmation.value) throw new Error('两次输入的密码不一致。');
   if (new TextEncoder().encode(password.value).length > 128) throw new Error('密码过长，请缩短后重试。');
   accountFeedback.textContent = registering ? '正在注册…' : '正在登录…';
   await finishLogin(await api(null, registering ? '/register' : '/login', {
    username:username.value.trim(), password:password.value, remember:$('remember-account').checked,
   }));
  });
 });

 function returnToSquare() {
  showEntry();
  $('town-title').focus();
 }

 backToSquare.addEventListener('click', returnToSquare);

 async function challenge(playerId) {
  prepareSound();
  playMusic();
  if (pending?.target_player_id !== playerId) {
   const requestId = [...crypto.getRandomValues(new Uint8Array(16))].map(byte => byte.toString(16).padStart(2, '0')).join('');
   pending = {target_zone:session.zone, target_player_id:playerId, request_id:requestId};
  }
  const report = await api(session.zone, '/battles', pending);
  pending = null;
  const reward = report.reward;
  const weapon = weaponMoves[reward?.weapon_id];
  let rewardText = reward ? `+${reward.xp} 经验` : '';
  if (reward?.level_up) rewardText += ` · 升至 Lv. ${reward.level} · ${weapon ? '获得' + weapon.label : '武器已集齐'}`;
  await playback(report, rewardText);
  await Promise.all([
   refreshHistory(),
   api(session.zone, '/session').then(renderPlayer),
  ]);
 }

 refreshOpponentsButton.addEventListener('click', () => run(refreshOpponents));

 $('switch-zone').addEventListener('click', () => run(showZones));
 function logout() {
  return run(async () => {
   await api(null, '/logout', {});
   account = session = pending = lastReport = null;
   selectedZone = null;
   showEntry();
   await refreshSavedAccounts();
   requestAnimationFrame(() => ($('saved-account-panel').hidden ? username : savedAccount).focus());
  });
 }
 $('online-logout').addEventListener('click', logout);
 $('zone-logout').addEventListener('click', logout);
 again.addEventListener('click', () => {
  if (lastReport) run(() => playback(lastReport));
 });
 battleView.append($('battle-game'), $('battle-log'));
 const battleNames = [$('name-left'), $('name-right')];
 const nameSizeObserver = new ResizeObserver(() => {
  for (const name of battleNames) {
   const width = name.offsetWidth;
   const available = name.parentElement.clientWidth;
   name.style.scale = width > available && available > 0 ? `${available / width} 1` : '';
  }
 });
 for (const name of battleNames) {
  nameSizeObserver.observe(name);
  nameSizeObserver.observe(name.parentElement);
 }
 $('arena-title').textContent = '乐斗';
 $('demo-label').hidden = true;
 backToSquare.hidden = false;
 again.textContent = '回放本场 ↗';
 showEntry();
 run(async () => {
  try {
   account = await api(null, '/session');
   await showZones();
  } catch (error) {
   account = null;
   if (error.code !== 'unauthorized') throw error;
   await refreshSavedAccounts();
  }
 });
}
