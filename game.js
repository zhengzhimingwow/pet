const $ = id => document.getElementById(id);
const start = $('start'), again = $('again'), skip = $('skip'), result = $('result'), logs = $('logs');
const arenaMusic = $('arena-music'), musicToggle = $('music-toggle');
const arena = $('arena'), game = arena.closest('.game'), speedToggle = $('speed-toggle');
const requestedDemo = new URLSearchParams(location.search).get('demo') ?? 'pan';
const panAttack = {
 name:'抡下平底锅', label:'平底锅', draw:'掏出平底锅 🍳', damage:18, icon:'🍳',
 weapon:'pan', spacing:.91, windUp:350, contact:[.78, .86],
 description:'双方每回合先掏锅，走近后举过头顶，再向下砸。',
};
const bladeAttack = {
 name:'力劈华山', label:'青龙偃月刀', draw:'亮出青龙偃月刀', damage:24, icon:'',
 weapon:'blade', spacing:.93, approachDuration:620, windUp:550, contact:[.88, .89],
 sprite:'assets/qq-penguin-blade-cleave.png',
 description:'拖刀上前，双手举刀过顶，一记力劈华山。',
};
const swordAttack = {
 name:'直刺', label:'轩辕剑', draw:'亮出轩辕剑', damage:21,
 weapon:'sword', spacing:.94, approachDuration:360, windUp:300, contact:[.94, .72],
 sprite:'assets/qq-penguin-sword-thrust.png',
 description:'亮剑上前，收剑蓄势，剑尖向前直刺。',
};
const weaponDemos = {pan:panAttack, blade:bladeAttack, sword:swordAttack};
const mode = Object.hasOwn(weaponDemos, requestedDemo) ? requestedDemo : 'normal';
const demoAttack = weaponDemos[mode];
const specialAttacks = [...Object.values(weaponDemos), {name:'使出旋风拳', damage:16, icon:'✊'}, {name:'挥舞软绵绵拖鞋', damage:14, icon:'🩴'}];
const punch = {name:'挥出一拳', damage:10, icon:'✦'};
const fighterNames = {left:'小团子', right:'大壮'};
const battleOpening = '叮！战斗开始，双方选手准备就绪。';
const metalOvertones = {
 pan:[[440, .11, .24], [763, .06, .19], [1319, .04, .12]],
 blade:[[680, .08, .20], [1027, .055, .17], [1831, .035, .11]],
 sword:[[930, .075, .16], [1480, .05, .12], [2340, .025, .08]],
};
let running = false, skipping = false, audioContext = null, soundEnabled = true;
const battleAnimations = new Set();
let battleSpeed = 1;
let musicEnabled = true;
try { musicEnabled = localStorage.getItem('arena-music') !== 'off'; } catch {}
arenaMusic.volume = .34;

function updateMusicToggle() {
 musicToggle.textContent = musicEnabled ? '♫ 音乐开' : '♫ 音乐关';
 musicToggle.setAttribute('aria-pressed', String(musicEnabled));
}
function playMusic() {
 if (musicEnabled && arenaMusic.paused) {
  // A browser may reject playback until the next user gesture.
  arenaMusic.play().catch(() => {});
 }
}
updateMusicToggle();
musicToggle.addEventListener('click', () => {
 musicEnabled = !musicEnabled;
 try { localStorage.setItem('arena-music', musicEnabled ? 'on' : 'off'); } catch {}
 updateMusicToggle();
 if (musicEnabled) playMusic();
 else arenaMusic.pause();
});

speedToggle.addEventListener('click', () => {
 battleSpeed = battleSpeed === 1 ? 2 : 1;
 speedToggle.textContent = `倍速 ${battleSpeed}×`;
 speedToggle.setAttribute('aria-pressed', String(battleSpeed === 2));
 syncBattleAnimations();
});

document.querySelector(`[data-mode="${mode}"]`).setAttribute('aria-current', 'page');
if (demoAttack) {
 $('demo-label').textContent = `${demoAttack.label}验收`;
 $('action-desc').textContent = demoAttack.description;
 if (demoAttack.sprite) new Image().src = demoAttack.sprite;
}
function prepareSound() {
 if (!soundEnabled) return;
 try { audioContext ||= new (window.AudioContext || window.webkitAudioContext)(); if (audioContext.state === 'suspended') audioContext.resume(); } catch (_) { audioContext = null; }
}
function hitSound(weapon) {
 if (!audioContext || !soundEnabled) return;
 const now = audioContext.currentTime, gain = audioContext.createGain(), tone = audioContext.createOscillator();
 tone.type = 'sine'; tone.frequency.setValueAtTime(170, now); tone.frequency.exponentialRampToValueAtTime(55, now + .1);
 gain.gain.setValueAtTime(.2, now); gain.gain.exponentialRampToValueAtTime(.001, now + .16);
 tone.connect(gain).connect(audioContext.destination); tone.start(now); tone.stop(now + .16);
 const buffer = audioContext.createBuffer(1, Math.floor(audioContext.sampleRate * .07), audioContext.sampleRate);
 const samples = buffer.getChannelData(0); for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length);
 const noise = audioContext.createBufferSource(), noiseGain = audioContext.createGain(); noise.buffer = buffer; noiseGain.gain.setValueAtTime(.1, now); noiseGain.gain.exponentialRampToValueAtTime(.001, now + .07); noise.connect(noiseGain).connect(audioContext.destination); noise.start(now);
 if (weapon) {
  for (const [frequency, volume, duration] of metalOvertones[weapon]) {
   const metal = audioContext.createOscillator();
   const envelope = audioContext.createGain();
   metal.frequency.value = frequency;
   envelope.gain.setValueAtTime(volume, now);
   envelope.gain.exponentialRampToValueAtTime(.001, now + duration);
   metal.connect(envelope).connect(audioContext.destination);
   metal.start(now);
   metal.stop(now + duration);
  }
 }
}
// Reserve room for both sprites, including the raised flippers.
const meleeSpacing = 1.08;
function fighterPosition(fighter) {
 const bounds = fighter.getBoundingClientRect();
 const spriteWidth = fighter.querySelector('.fighter-art').offsetWidth;
 return {
  x: bounds.left + bounds.width / 2,
  y: bounds.top + bounds.height * .48,
  spriteWidth: spriteWidth * bounds.width / fighter.offsetWidth,
 };
}
function kickUpDust(fighter, contactX) {
 const arenaBounds = arena.getBoundingClientRect();
 const bounds = fighter.getBoundingClientRect();
 const dust = $('dust');
 const center = contactX ?? bounds.left + bounds.width / 2;
 dust.style.left = `${center - arenaBounds.left}px`;
 dust.style.top = `${bounds.bottom - arenaBounds.top - 10}px`;
 animate(dust, 'show');
}
function impactAt(attacker, defender, melee, move) {
 const rect = arena.getBoundingClientRect(), impact = $('impact');
 const position = fighterPosition(defender);
 let contactX = melee ? (fighterPosition(attacker).x + position.x) / 2 : position.x;
 let contactY = position.y;
 if (move.contact) {
  const [frontX, frameY] = move.contact;
  const art = attacker.querySelector('.fighter-art').getBoundingClientRect();
  const localX = attacker.classList.contains('left') ? frontX : 1 - frontX;
  contactX = art.left + art.width * localX;
  contactY = art.top + art.height * frameY;
 }
 if (move.weapon === 'pan') kickUpDust(attacker, contactX);
 impact.style.left = (contactX - rect.left) + 'px';
 impact.style.top = (contactY - rect.top) + 'px';
 impact.dataset.weapon = move.weapon ?? '';
 animate(impact, 'show');
 animate(arena, 'shake');
 hitSound(move.weapon);
}
async function hitPause(attacker, duration = 85) {
 const poses = attacker.querySelector('.fighter-art').getAnimations();
 poses.forEach(animation => animation.pause());
 await wait(duration);
 if (!skipping) poses.forEach(animation => animation.play());
}
function syncBattleAnimations() {
 for (const animation of game.getAnimations({subtree:true})) {
  if (animation.playState !== 'finished') animation.updatePlaybackRate(battleSpeed);
 }
}
function wait(ms) {
 // An empty animation puts delays on the same timeline as the combat poses.
 return playBattleAnimation(arena, [], ms);
}
function animate(el, cls) {
 el.classList.remove(cls);
 void el.offsetWidth;
 el.classList.add(cls);
 if (el.classList.contains('fighter')) wait(800).then(() => el.classList.remove(cls));
}
function playBattleAnimation(element, keyframes, timing) {
 const animation = element.animate(keyframes, timing);
 battleAnimations.add(animation);
 syncBattleAnimations();
 return animation.finished.finally(() => battleAnimations.delete(animation));
}
async function moveToOpponent(attacker, defender, move) {
 const from = fighterPosition(attacker), to = fighterPosition(defender);
 const spacing = move.spacing ?? meleeSpacing;
 const separation = (from.spriteWidth + to.spriteWidth) / 2 * spacing;
 const delta = to.x - from.x;
 const distance = Math.sign(delta) * Math.max(0, Math.abs(delta) - separation);
 const dragging = move.weapon === 'blade';
 if (dragging) attacker.classList.add('dragging-blade');
 await playBattleAnimation(attacker, [{translate:'0px 0px'}, {translate:distance + 'px 0px'}], {
  duration:move.approachDuration ?? 400, easing:'ease-in', fill:'forwards',
 });
 if (dragging) attacker.classList.remove('dragging-blade');
 if (!skipping && Math.abs(distance) > 10) kickUpDust(attacker);
 return distance;
}
async function returnToPlace(attacker, distance) {
 await playBattleAnimation(attacker, [{translate:distance + 'px 0px'}, {translate:'0px 0px'}], {duration:380, easing:'ease-out'});
 clearMovement(attacker);
}
function clearMovement(fighter) {
 // Remove the forward-filled approach animation after the return completes.
 fighter.getAnimations().filter(a => a.effect instanceof KeyframeEffect && a.effect.target === fighter && a.playState === 'finished').forEach(a => a.cancel());
}
function say(text) { const p = document.createElement('p'); p.textContent = text; logs.prepend(p); }
function reportTurnEvent(number, text) {
 say(`第 ${number} 回合 · ${text}`);
}
function reportWeaponDraw({number, attacker, move}) {
 if (move.weapon) reportTurnEvent(number, fighterNames[attacker] + move.draw + '！');
}
function reportTurnResult({number, attacker, defender, move, dodge, damage, remainingHp}) {
 const name = fighterNames[attacker], target = fighterNames[defender];
 if (dodge) {
  reportTurnEvent(number, name + '挥出一拳，' + target + '灵巧地躲开了！');
  return;
 }
 const attackName = move.icon ? `${move.name} ${move.icon}` : `用${move.label}${move.name}`;
 reportTurnEvent(number, name + attackName + '，对' + target + '造成 ' + damage + ' 点伤害！');
 if (remainingHp === 0) reportTurnEvent(number, target + '倒下了！');
}
function showFloat(side, text) { const el = $('float-' + side); el.textContent = text; animate(el, 'show'); }
function updateHp(side, hp) {
 const fill = $('hp-' + side);
 const bar = fill.parentElement;
 bar.classList.toggle('is-damaged', hp < 100);
 fill.style.width = `${hp}%`;
 bar.querySelector('.bar-ghost').style.width = `${hp}%`;
 $('hp-' + side + '-text').textContent = `${hp} / 100`;
}
function simulateBattle() {
 const hp = {left:100, right:100};
 const turns = [];
 while (hp.left > 0 && hp.right > 0) {
  const number = turns.length + 1;
  const attacker = number % 2 === 1 ? 'left' : 'right';
  const defender = attacker === 'left' ? 'right' : 'left';
  const roll = Math.random();
  const dodge = !demoAttack && roll < .16;
  const special = roll >= .16 && roll < .53;
  const move = demoAttack ?? (special ? specialAttacks[Math.floor(Math.random() * specialAttacks.length)] : punch);
  const damage = dodge ? 0 : move.damage + Math.floor(Math.random() * 7);
  hp[defender] = Math.max(0, hp[defender] - damage);
  turns.push({number, attacker, defender, move, dodge, damage, remainingHp:hp[defender]});
 }
 return {turns, hp};
}
async function playTurns(turns) {
 for (const turn of turns) {
  await wait(850);
  if (skipping) return;
  const {number, attacker, defender, move, dodge, damage, remainingHp} = turn;
  $('round').textContent = `第 ${number} 回合${demoAttack ? ' · ' + demoAttack.label : ''}`;
  // Melee attacks approach first; future ranged moves can set range: 'ranged'.
  const attackerEl = $(attacker), defenderEl = $(defender);
  const melee = move.range !== 'ranged';
  const weaponClass = move.weapon && `using-${move.weapon}`;
  if (weaponClass) {
   attackerEl.classList.add(weaponClass, 'drawing-weapon');
   reportWeaponDraw(turn);
   await wait(550);
   if (skipping) return;
   attackerEl.classList.remove('drawing-weapon');
  }
  const distance = melee ? await moveToOpponent(attackerEl, defenderEl, move) : 0;
  if (skipping) return;
  attackerEl.classList.add('striking');
  await wait(move.windUp ?? 315);
  if (skipping) return;
  if (dodge) {
   animate(defenderEl, 'dodge');
   showFloat(defender, '闪避！');
  } else {
   animate(defenderEl, 'hit');
   showFloat(defender, '−' + damage);
   impactAt(attackerEl, defenderEl, melee, move);
   updateHp(defender, remainingHp);
   if (remainingHp === 0) defenderEl.classList.add('defeated');
  }
  reportTurnResult(turn);
  if (!dodge) {
   await hitPause(attackerEl, demoAttack ? 320 : 85);
   if (skipping) return;
  }
  await wait(400);
  if (skipping) return;
  attackerEl.classList.remove('striking');
  if (melee) await returnToPlace(attackerEl, distance);
  if (skipping) return;
  if (weaponClass) attackerEl.classList.remove(weaponClass);
 }
 await wait(700);
}
function showSkippedOutcome(hp, turns) {
 game.classList.add('is-skipped');
 const weaponClasses = Object.keys(weaponDemos).map(weapon => `using-${weapon}`);
 for (const side of Object.keys(hp)) {
  const fighter = $(side);
  fighter.classList.remove('striking', 'drawing-weapon', 'dragging-blade', 'hit', 'dodge', ...weaponClasses);
  clearMovement(fighter);
  fighter.classList.toggle('defeated', hp[side] === 0);
  $('float-' + side).classList.remove('show');
  updateHp(side, hp[side]);
 }
 arena.classList.remove('shake');
 $('impact').classList.remove('show');
 $('dust').classList.remove('show');
 logs.replaceChildren();
 say(battleOpening);
 for (const turn of turns) {
  reportWeaponDraw(turn);
  reportTurnResult(turn);
 }
 say(`已跳过剩余战斗动画，共 ${turns.length} 回合。`);
 logs.scrollTop = 0;
}
async function battle() {
 if (running) return;
 const {turns, hp} = simulateBattle();
 prepareSound();
 playMusic();
 running = true;
 skipping = false;
 game.classList.remove('is-skipped');
 result.hidden = true;
 skip.hidden = false;
 start.disabled = true;
 start.textContent = '战斗进行中…';
 $('round').textContent = '准备开战';
 $('action-title').textContent = '战斗进行中！';
 $('action-desc').textContent = '小选手们正在全力以赴。';
 logs.replaceChildren();
 for (const side of Object.keys(hp)) {
  $(side).classList.remove('defeated');
  updateHp(side, 100);
 }
 say(battleOpening);
 await playTurns(turns);
 if (skipping) showSkippedOutcome(hp, turns);
 const win = fighterNames[hp.left > 0 ? 'left' : 'right'];
 $('round').textContent = '战斗结束';
 $('winner').textContent = win + '获胜！';
 $('result-text').textContent = skipping ? `战斗已结算，共 ${turns.length} 回合。` : '精彩的一场对决，给两位选手鼓鼓掌！';
 say('🎉 ' + win + '赢得了这场欢乐对决！');
 result.hidden = false;
 skip.hidden = true;
 running = false;
 start.disabled = false;
 start.innerHTML = '再来一场 <span>↗</span>';
 $('action-title').textContent = '精彩对决！';
 $('action-desc').textContent = '换个运气，再战一场吧。';
 if (skipping) again.focus({preventScroll:true});
 syncBattleAnimations();
}
start.addEventListener('click',battle); again.addEventListener('click',battle);
skip.addEventListener('click', () => {
 if (!running || skipping) return;
 skipping = true;
 // Release the active playback waits so the precomputed result can render.
 for (const animation of battleAnimations) animation.finish();
});

$('sound').addEventListener('click', () => { soundEnabled = !soundEnabled; $('sound').textContent = soundEnabled ? '🔊 音效开' : '🔇 音效关'; $('sound').setAttribute('aria-pressed', String(soundEnabled)); $('sound').setAttribute('aria-label', soundEnabled ? '关闭音效' : '开启音效'); if (soundEnabled) prepareSound(); });
