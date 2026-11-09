const $ = id => document.getElementById(id);
const start = $('start'), again = $('again'), result = $('result'), logs = $('logs');
const requestedDemo = new URLSearchParams(location.search).get('demo');
const panDemo = requestedDemo === null || requestedDemo === 'pan';
const panAttack = {name:'抡下平底锅', damage:18, icon:'🍳', weapon:'pan'};
const specialAttacks = [panAttack, {name:'使出旋风拳', damage:16, icon:'✊'}, {name:'挥舞软绵绵拖鞋', damage:14, icon:'🩴'}];
const punch = {name:'挥出一拳', damage:10, icon:'✦'};
let running = false, battleId = 0, audioContext = null, soundEnabled = true;

if (panDemo) {
 $('demo-label').textContent = '平底锅验收';
 $('action-desc').textContent = '双方每回合先掏锅，走近后举过头顶，再向下砸。';
}
function prepareSound() {
 if (!soundEnabled) return;
 try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); if (audioContext.state === 'suspended') audioContext.resume(); } catch (_) { audioContext = null; }
}
function hitSound() {
 if (!audioContext || !soundEnabled) return;
 const now = audioContext.currentTime, gain = audioContext.createGain(), tone = audioContext.createOscillator();
 tone.type = 'sine'; tone.frequency.setValueAtTime(170, now); tone.frequency.exponentialRampToValueAtTime(55, now + .1);
 gain.gain.setValueAtTime(.2, now); gain.gain.exponentialRampToValueAtTime(.001, now + .16);
 tone.connect(gain).connect(audioContext.destination); tone.start(now); tone.stop(now + .16);
 const buffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * .07), audioContext.sampleRate);
 const samples = buffer.getChannelData(0); for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
 const noise = audioContext.createBufferSource(), noiseGain = audioContext.createGain(); noise.buffer = buffer; noiseGain.gain.setValueAtTime(.1, now); noiseGain.gain.exponentialRampToValueAtTime(.001, now + .07); noise.connect(noiseGain).connect(audioContext.destination); noise.start(now);
}
// Reserve room for both sprites, including the raised flippers.
const meleeSpacing = 1.08;
const panSpacing = .91;
function fighterPosition(fighter) {
 const bounds = fighter.getBoundingClientRect();
 const spriteWidth = fighter.querySelector('.fighter-art').offsetWidth;
 return {
  x: bounds.left + bounds.width / 2,
  y: bounds.top + bounds.height * .48,
  spriteWidth: spriteWidth * bounds.width / fighter.offsetWidth,
 };
}
function impactAt(attacker, defender, melee, usesPan) {
 const arena = $('arena'), rect = arena.getBoundingClientRect(), impact = $('impact');
 const position = fighterPosition(defender);
 let contactX = melee ? (fighterPosition(attacker).x + position.x) / 2 : position.x;
 let contactY = position.y;
 if (usesPan) {
  // The pan bowl is drawn into the lower front of the smash frame.
  const art = attacker.querySelector('.fighter-art').getBoundingClientRect();
  const bowlX = attacker.classList.contains('left') ? .78 : .22;
  contactX = art.left + art.width * bowlX;
  contactY = art.top + art.height * .86;
 }
 impact.style.left = (contactX - rect.left) + 'px';
 impact.style.top = (contactY - rect.top) + 'px';
 animate(impact, 'show'); animate(arena, 'shake'); hitSound();
}
async function hitPause(attacker, duration = 85) {
 const poses = attacker.querySelector('.fighter-art').getAnimations();
 poses.forEach(animation => animation.pause());
 await wait(duration);
 poses.forEach(animation => animation.play());
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function animate(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); if (el.classList.contains('fighter')) setTimeout(() => el.classList.remove(cls), 800); }
async function moveToOpponent(attacker, defender, spacing) {
 const from = fighterPosition(attacker), to = fighterPosition(defender);
 const separation = (from.spriteWidth + to.spriteWidth) / 2 * spacing;
 const delta = to.x - from.x;
 const distance = Math.sign(delta) * Math.max(0, Math.abs(delta) - separation);
 await attacker.animate([{translate:'0px 0px'}, {translate:distance + 'px 0px'}], {duration:400, easing:'ease-in', fill:'forwards'}).finished;
 return distance;
}
async function returnToPlace(attacker, distance) {
 const animation = attacker.animate([{translate:distance + 'px 0px'}, {translate:'0px 0px'}], {duration:380, easing:'ease-out'});
 await animation.finished;
 // Remove the forward-filled approach animation after the return completes.
 attacker.getAnimations().filter(a => a.effect instanceof KeyframeEffect && a.effect.target === attacker && a.playState === 'finished').forEach(a => a.cancel());
}
function say(text) { const p = document.createElement('p'); p.textContent = text; logs.prepend(p); }
function showFloat(side, text) { const el = $('float-' + side); el.textContent = text; animate(el, 'show'); }
function updateHp(side, hp) { $('hp-' + side).style.width = hp + '%'; $('hp-' + side + '-text').textContent = hp + ' / 100'; }
async function battle() {
 if (running) return; prepareSound(); running = true; const id = ++battleId; result.hidden = true; start.disabled = true; start.textContent = '战斗进行中…'; $('action-title').textContent = '战斗进行中！'; $('action-desc').textContent = '小选手们正在全力以赴。'; logs.replaceChildren();
 $('left').classList.remove('defeated');
 $('right').classList.remove('defeated');
 const hp = {left:100,right:100}; updateHp('left',100); updateHp('right',100); say('叮！战斗开始，双方选手准备就绪。');
 let turn = 0;
 while (hp.left > 0 && hp.right > 0 && id === battleId) {
  await wait(850);
  turn++;
  $('round').textContent = `第 ${turn} 回合${panDemo ? ' · 平底锅' : ''}`;
  const attacker = turn % 2 ? 'left' : 'right', defender = attacker === 'left' ? 'right' : 'left';
  const name = attacker === 'left' ? '小团子' : '大壮', target = defender === 'left' ? '小团子' : '大壮';
  const roll = Math.random();
  const dodge = !panDemo && roll < .16;
  const special = roll >= .16 && roll < .53;
  let move = panAttack;
  if (!panDemo) move = special ? specialAttacks[Math.floor(Math.random() * specialAttacks.length)] : punch;
  // Melee attacks approach first; future ranged moves can set range: 'ranged'.
  const attackerEl = $(attacker), defenderEl = $(defender);
  const melee = move.range !== 'ranged';
  const usesPan = move.weapon === 'pan';
  if (usesPan) {
   attackerEl.classList.add('using-pan', 'drawing-pan');
   say(name + '掏出平底锅 🍳！');
   await wait(550);
   attackerEl.classList.remove('drawing-pan');
  }
  const distance = melee ? await moveToOpponent(attackerEl, defenderEl, usesPan ? panSpacing : meleeSpacing) : 0;
  attackerEl.classList.add('striking');
  await wait(usesPan ? 350 : 315);
  if (dodge) { animate($(defender),'dodge'); showFloat(defender,'闪避！'); say(name + '挥出一拳，' + target + '灵巧地躲开了！'); }
  else {
   const damage = move.damage + Math.floor(Math.random() * 7);
   hp[defender] = Math.max(0, hp[defender] - damage);
   animate(defenderEl, 'hit');
   showFloat(defender, '−' + damage);
   impactAt(attackerEl, defenderEl, melee, usesPan);
   updateHp(defender, hp[defender]);
   say(name + move.name + ' ' + move.icon + '，对' + target + '造成 ' + damage + ' 点伤害！');
   if (hp[defender] === 0) {
    defenderEl.classList.add('defeated');
    say(target + '倒下了！');
   }
   await hitPause(attackerEl, panDemo ? 320 : 85);
  }
  await wait(400);
  attackerEl.classList.remove('striking');
  if (melee) await returnToPlace(attackerEl, distance);
  if (usesPan) attackerEl.classList.remove('using-pan');
 }
 await wait(700); if (id !== battleId) return;
 const win = hp.left > 0 ? '小团子' : '大壮'; $('round').textContent = '战斗结束'; $('winner').textContent = win + '获胜！'; $('result-text').textContent = '精彩的一场对决，给两位选手鼓鼓掌！'; say('🎉 ' + win + '赢得了这场欢乐对决！'); result.hidden = false; running = false; start.disabled = false; start.innerHTML = '再来一场 <span>↗</span>'; $('action-title').textContent = '精彩对决！'; $('action-desc').textContent = '换个运气，再战一场吧。';
}
start.addEventListener('click',battle); again.addEventListener('click',battle);

$('sound').addEventListener('click', () => { soundEnabled = !soundEnabled; $('sound').textContent = soundEnabled ? '🔊 音效开' : '🔇 音效关'; $('sound').setAttribute('aria-pressed', String(soundEnabled)); $('sound').setAttribute('aria-label', soundEnabled ? '关闭音效' : '开启音效'); if (soundEnabled) prepareSound(); });
