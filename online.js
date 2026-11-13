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
 const opponentsList = $('town-opponents');
 const opponentsEmpty = $('town-opponents-empty');
 const refreshOpponentsButton = $('refresh-opponents');
 const zoneGroups = $('zone-groups');
 const zoneOptions = $('zone-options');
 const zoneEnter = $('zone-enter');
 const savedAccount = $('saved-account');
 const zonesPerGroup = 10;
 let account;
 let session;
 let selectedZone;
 let registering = false;
 let busy = false;
 let pending;
 let lastReport;

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
  session = data;
  const {player, zone} = data;
  const weapon = {pan:panAttack.label, blade:bladeAttack.label, sword:swordAttack.label}[player.weapon_id];
  $('town-zone').textContent = `${zone} 服`;
  $('town-player-name').textContent = player.name;
  $('online-player').textContent = `UID ${player.player_id}`;
  $('town-hp').textContent = player.max_hp;
  $('town-attack').textContent = player.attack;
  $('town-defense').textContent = player.defense;
  $('town-weapon').textContent = weapon ?? '未装备';
  $('town-weapon-icon').textContent = player.weapon_id === 'pan' ? '🍳' : weapon ? '⚔' : '–';
  $('town-skill').textContent = player.skill_id === 'combo' ? '连击' : '未装备';
  townFeedback.textContent = '';
  $('town-history-empty').hidden = true;
  opponentsEmpty.hidden = true;
  opponentsList.replaceChildren();
  showEntry();
 }

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
  for (const button of townHistory.querySelectorAll('button')) button.disabled = value;
  for (const button of opponentsList.querySelectorAll('button')) button.disabled = value;
  for (const button of zoneOptions.querySelectorAll('button')) button.disabled = value;
  for (const button of zoneGroups.querySelectorAll('button')) button.disabled = value;
  zoneEnter.disabled = value || !selectedZone;
 }

 function playback(report) {
  townStage.hidden = true;
  battleView.hidden = false;
  $('arena-title').focus({preventScroll:true});
  battleView.scrollIntoView({block:'nearest'});
  lastReport = report;
  const turns = [];
  const totals = new Map();
  const moves = {pan:panAttack, blade:bladeAttack, sword:swordAttack, punch};
  for (const event of report.events) {
   let turn = turns.at(-1);
   if (turn?.number !== event.round) {
    turn = {
     number:event.round, attacker:event.actor, defender:event.target,
     move:moves[event.move_id] ?? punch, dodge:event.kind === 'dodge',
     damage:0, remainingHp:event.remaining_hp, events:[],
    };
    turns.push(turn);
   }
   turn.events.push(event);
   turn.damage += event.applied_damage;
   turn.remainingHp = event.remaining_hp;
   if (event.kind === 'hit') {
    const key = `${event.actor}:${event.source_type}:${event.source_id}`;
    const total = totals.get(key) ?? {actor:event.actor, name:event.source_name, damage:0};
    total.damage += event.applied_damage;
    totals.set(key, total);
   }
  }
  return playBattle({
   turns, hp:{left:report.left_hp, right:report.right_hp}, winner:report.winner,
   players:{left:report.attacker, right:report.defender}, damageTotals:[...totals.values()],
  });
 }

 async function refreshHistory() {
  const {battles} = await api(session.zone, '/battles');
  townHistory.replaceChildren();
  $('town-history-empty').hidden = Boolean(battles.length);
  for (const report of battles) {
   const item = document.createElement('li');
   const button = document.createElement('button');
   const name = document.createElement('span');
   const result = document.createElement('span');
   button.type = 'button';
   button.disabled = busy;
   name.textContent = report.opponent;
   result.className = `town-outcome town-outcome-${report.winner}`;
   result.textContent = {left:'胜', right:'负', draw:'平'}[report.winner];
   button.setAttribute('aria-label', `回放对战 ${report.opponent}，${result.textContent}`);
   button.title = report.created_at.slice(0, 19);
   button.append(name, result);
   button.addEventListener('click', () => run(async () => playback(await api(session.zone, `/battles/${report.battle_id}`))));
   item.append(button);
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

 backToSquare.addEventListener('click', () => {
  showEntry();
  $('town-title').focus();
 });

 async function challenge(playerId) {
  prepareSound();
  playMusic();
  if (pending?.target_player_id !== playerId) {
   const requestId = [...crypto.getRandomValues(new Uint8Array(16))].map(byte => byte.toString(16).padStart(2, '0')).join('');
   pending = {target_zone:session.zone, target_player_id:playerId, request_id:requestId};
  }
  const report = await api(session.zone, '/battles', pending);
  pending = null;
  await playback(report);
  await refreshHistory();
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
