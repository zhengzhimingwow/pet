if (onlineMode) {
 const panel = $('online-panel');
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
  unauthorized: '试玩口令无效，请检查区服和口令。',
  not_found: '没有找到该角色或战报。',
  same_player: '请选择其他玩家。',
  invalid_request: '请检查区服和角色编号。',
  request_conflict: '请求编号已被使用，请重新选择对手。',
  unavailable: '区服或战斗服暂时不可用，请稍后重试。',
 };

 async function api(credentials, path, body) {
  const response = await fetch(`api/zone/${credentials.zone}${path}`, {
   method: body ? 'POST' : 'GET',
   headers: {Authorization: `Bearer ${credentials.token}`, 'Content-Type': 'application/json'},
   body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(messages[data.error] ?? messages.unavailable);
  return data;
 }

 function setup() {
  panel.hidden = false;
  start.hidden = true;
  $('demo-label').textContent = '联机对战';
  $('action-desc').textContent = '登录试玩后即可挑战玩家。';
  again.textContent = '回放本场 ↗';
 }

 function lock(value) {
  busy = value;
  challengeButton.disabled = value;
  $('online-logout').disabled = value;
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
  const {battles} = await api(session, '/battles');
  history.replaceChildren();
  for (const report of battles) {
   const item = document.createElement('li');
   const button = document.createElement('button');
   const outcome = {left:'胜', right:'负', draw:'平局'}[report.winner];
   button.type = 'button';
   button.className = 'sound-toggle';
   button.textContent = `回放 · ${report.opponent} · ${outcome} · ${report.created_at.slice(0, 19)}`;
   button.disabled = busy;
   button.addEventListener('click', () => run(async () => playback(await api(session, `/battles/${report.battle_id}`))));
   item.append(button);
   history.append(item);
  }
 }

 async function run(action) {
  if (busy) return;
  lock(true);
  feedback.textContent = '';
  try {
   await action();
  } catch (error) {
   feedback.textContent = error instanceof SyntaxError || error instanceof TypeError ? messages.unavailable : error.message;
  } finally {
   lock(false);
  }
 }

 loginForm.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
   const credentials = {zone:Number($('login-zone').value), token:$('login-token').value.trim()};
   const {player} = await api(credentials, '/session');
   session = credentials;
   $('online-player').textContent = `${player.name} · ${credentials.zone} 服 · 角色编号 ${player.player_id}`;
   $('target-zone').value = String(credentials.zone);
   $('target-player').value = player.player_id.endsWith('001') ? `${credentials.zone}002` : `${credentials.zone}001`;
   $('online-hint').textContent = '试玩角色 · 1 服 1001、1002 · 2 服 2001、2002';
   loginForm.reset();
   loginForm.hidden = true;
   $('online-session').hidden = false;
   $('action-desc').textContent = '选择区服和对手即可开打。';
   await refreshHistory();
  });
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
   const report = await api(session, '/battles', pending);
   pending = null;
   feedback.textContent = '';
   await playback(report);
   await refreshHistory();
  });
 });

 $('online-logout').addEventListener('click', () => location.reload());
 again.addEventListener('click', () => run(() => playback(lastReport)));
 setup();
}
