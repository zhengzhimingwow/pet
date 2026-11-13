if (onlineMode) {
 const panel = $('online-panel');
 const entry = $('account-entry');
 const shell = $('game-shell');
 const accountFeedback = $('account-feedback');
 const loginForm = $('online-login');
 const challengeForm = $('online-challenge');
 const history = $('battle-history');
 const feedback = $('online-feedback');
 const challengeButton = $('challenge');
 const zoneOptions = $('zone-options');
 const savedAccount = $('saved-account');
 let account;
 let session;
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
  invalid_request: '请检查区服和角色编号。',
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
  shell.hidden = true;
  document.documentElement.classList.remove('in-arena');
  entry.hidden = false;
  $('account-login').hidden = Boolean(account);
  $('account-zones').hidden = !account || Boolean(session);
  $('account-lobby').hidden = !session;
 }

 async function showZones() {
  const {zones} = await api(null, '/zones');
  session = pending = lastReport = null;
  history.replaceChildren();
  $('zone-copy').textContent = `已登录 ${account.username}，请选择要进入的区服。`;
  zoneOptions.replaceChildren(...zones.map(zone => {
   const button = document.createElement('button');
   button.type = 'button';
   button.className = 'entry-button';
   button.disabled = busy;
   button.textContent = `进入 ${zone.name}`;
   button.addEventListener('click', () => run(async () => {
    acceptSession(await api(zone.id, '/enter', {}));
    requestAnimationFrame(() => $('enter-arena').focus());
   }));
   return button;
  }));
  showEntry();
  $('zone-title').focus();
 }

 function acceptSession(data) {
  session = data;
  const {player, zone} = data;
  $('online-player').textContent = `${player.name} · ${zone} 服 · 角色编号 ${player.player_id}`;
  $('target-zone').value = String(zone);
  $('target-player').value = player.player_id === `${zone}001` ? `${zone}002` : `${zone}001`;
  showEntry();
 }

 function lock(value) {
  busy = value;
  $('login-submit').disabled = value;
  challengeButton.disabled = value;
  $('online-logout').disabled = value;
  $('zone-logout').disabled = value;
  $('switch-zone').disabled = value;
  $('toggle-register').disabled = value;
  savedAccount.disabled = value;
  $('saved-login').disabled = value;
  $('saved-forget').disabled = value;
  $('enter-arena').disabled = value;
  $('back-lobby').disabled = value;
  for (const button of history.querySelectorAll('button')) button.disabled = value;
  for (const button of zoneOptions.querySelectorAll('button')) button.disabled = value;
 }

 function playback(report) {
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
  history.replaceChildren();
  for (const report of battles) {
   const item = document.createElement('li');
   const button = document.createElement('button');
   const outcome = {left:'胜', right:'负', draw:'平局'}[report.winner];
   button.type = 'button';
   button.className = 'sound-toggle';
   button.textContent = `回放 · ${report.opponent} · ${outcome} · ${report.created_at.slice(0, 19)}`;
   button.disabled = busy;
   button.addEventListener('click', () => run(async () => playback(await api(session.zone, `/battles/${report.battle_id}`))));
   item.append(button);
   history.append(item);
  }
 }

 async function run(action) {
  if (busy) return;
  lock(true);
  const status = shell.hidden ? accountFeedback : feedback;
  status.textContent = '';
  try {
   await action();
  } catch (error) {
   if (error.code === 'unauthorized') {
    account = session = pending = lastReport = null;
    setRegistration(false);
    showEntry();
    accountFeedback.textContent = messages.unauthorized;
    await refreshSavedAccounts().catch(() => {});
   } else {
    status.textContent = error instanceof SyntaxError || error instanceof TypeError ? messages.unavailable : error.message;
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

 $('enter-arena').addEventListener('click', () => run(async () => {
  entry.hidden = true;
  shell.hidden = false;
  document.documentElement.classList.add('in-arena');
  panel.hidden = false;
  $('online-session').hidden = false;
  start.hidden = true;
  $('demo-label').textContent = '联机对战';
  $('action-desc').textContent = '选择区服和对手即可开打。';
  again.textContent = '回放本场 ↗';
  await refreshHistory();
 }));

 $('back-lobby').addEventListener('click', () => {
  document.documentElement.classList.remove('in-arena');
  showEntry();
  $('enter-arena').focus();
 });

 challengeForm.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
   prepareSound();
   playMusic();
   const target = {target_zone:Number($('target-zone').value), target_player_id:$('target-player').value.trim()};
   if (pending?.target_zone !== target.target_zone || pending.target_player_id !== target.target_player_id) {
    const requestId = [...crypto.getRandomValues(new Uint8Array(16))].map(byte => byte.toString(16).padStart(2, '0')).join('');
    pending = {...target, request_id:requestId};
   }
   feedback.textContent = '正在计算战斗…';
   const report = await api(session.zone, '/battles', pending);
   pending = null;
   feedback.textContent = '';
   await playback(report);
   await refreshHistory();
  });
 });

 $('switch-zone').addEventListener('click', () => run(showZones));
 function logout() {
  return run(async () => {
   await api(null, '/logout', {});
   account = session = pending = lastReport = null;
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
