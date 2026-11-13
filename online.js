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
 let session;
 let busy = false;
 let pending;
 let lastReport;

 const messages = {
  unauthorized: '登录已失效，请重新登录。',
  invalid_credentials: '账号、密码或区服有误，请检查后重试。',
  rate_limited: '登录尝试较多，请稍后重试。',
  not_found: '没有找到该角色或战报。',
  same_player: '请选择其他玩家。',
  invalid_request: '请检查区服和角色编号。',
  request_conflict: '请求编号已被使用，请重新选择对手。',
  unavailable: '区服或战斗服暂时不可用，请稍后重试。',
 };

 async function api(zone, path, body) {
  const response = await fetch(`api/zone/${zone}${path}`, {
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
  $('account-login').hidden = Boolean(session);
  $('account-lobby').hidden = !session;
 }

 function acceptSession(data) {
  session = data;
  const {player, zone} = data;
  sessionStorage.setItem('penguin-zone', String(zone));
  $('online-player').textContent = `${player.name} · ${zone} 服`;
  $('target-zone').value = String(zone);
  $('target-player').value = player.player_id.endsWith('001') ? `${zone}002` : `${zone}001`;
  showEntry();
 }

 function lock(value) {
  busy = value;
  $('login-submit').disabled = value;
  challengeButton.disabled = value;
  $('online-logout').disabled = value;
  $('enter-arena').disabled = value;
  $('back-lobby').disabled = value;
  for (const button of history.querySelectorAll('button')) button.disabled = value;
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
    session = null;
    sessionStorage.removeItem('penguin-zone');
    showEntry();
    accountFeedback.textContent = messages.unauthorized;
   } else {
    status.textContent = error instanceof SyntaxError || error instanceof TypeError ? messages.unavailable : error.message;
   }
  } finally {
   lock(false);
  }
 }

 const password = $('login-password');
 const visibility = $('password-visibility');
 function showPassword(visible) {
  password.type = visible ? 'text' : 'password';
  visibility.textContent = visible ? '隐藏' : '显示';
  visibility.setAttribute('aria-label', visible ? '隐藏密码' : '显示密码');
  visibility.setAttribute('aria-pressed', String(visible));
 }

 visibility.addEventListener('click', () => showPassword(password.type === 'password'));
 loginForm.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
   const zone = Number($('login-zone').value);
   accountFeedback.textContent = '正在登录…';
   const data = await api(zone, '/login', {username:$('login-account').value.trim(), password:password.value});
   password.value = '';
   showPassword(false);
   accountFeedback.textContent = '';
   acceptSession(data);
   $('enter-arena').focus();
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

 $('online-logout').addEventListener('click', () => run(async () => {
  await api(session.zone, '/logout', {});
  sessionStorage.removeItem('penguin-zone');
  location.reload();
 }));
 again.addEventListener('click', () => run(() => playback(lastReport)));
 showEntry();
 const lastZone = Number(sessionStorage.getItem('penguin-zone'));
 if (lastZone === 1 || lastZone === 2) {
  $('login-zone').value = String(lastZone);
  run(async () => {
   $('login-submit').disabled = true;
   try {
    acceptSession(await api(lastZone, '/session'));
   } catch (error) {
    if (error.code !== 'unauthorized') throw error;
    sessionStorage.removeItem('penguin-zone');
   }
  });
 }
}
