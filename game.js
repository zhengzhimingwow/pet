const $ = id => document.getElementById(id);
const start = $('start'), again = $('again'), skip = $('skip'), result = $('result'), logs = $('logs');
const arenaMusic = $('arena-music'), musicToggle = $('music-toggle');
const arena = $('arena'), game = arena.closest('.game'), speedToggle = $('speed-toggle');
const queryParams = new URLSearchParams(location.search);
const onlineMode = queryParams.has('online') || !queryParams.has('demo');
const requestedDemo = queryParams.get('demo') ?? 'pan';
const panAttack = {
 name:'抡击', label:'平底锅', draw:'掏出平底锅 🍳', damage:18, icon:'🍳',
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
const weaponMoves = {...weaponDemos, ...customWeaponMoves};
const weaponEffects = {
 pan:'手麻 · 命中后，对手下一次命中的伤害降低 25%。',
 sword:'破甲 · 命中时无视对手一半防御。',
 blade:'斩杀 · 命中生命低于 30% 的对手时，伤害提高 35%。',
 umbrella:'护盾 · 命中后获得一层护盾，抵挡下一次命中的最多 12 点伤害。',
 hammer:'碎盾 · 命中时击碎护盾，本次攻击不被该护盾减伤。',
 bat:'开场重击 · 对生命至少还有 70% 的对手额外造成 7 点伤害。',
 broom:'露出破绽 · 命中后，己方下次具备连击条件时必定追加连击。',
 spatula:'翻身 · 命中后清除自身减益，并恢复最多 4 点生命。',
 boxing:'补拳 · 主击命中且对手未倒下时，追加一拳，基础伤害 5 点。',
 yo_yo:'专注 · 命中后，下次主击命中的暴击率提高 20 个百分点。',
 boomerang:'折返 · 首击被闪避时，折返追击，基础伤害 5 点。',
 snowball:'冰冷 · 命中后，对手下一次主击命中无法暴击。',
 water:'浸湿 · 命中后，对手下一次受击的计算伤害增加 5 点。',
 fan:'借风 · 命中后，下次被主击时的闪避率提高 18 个百分点。',
 slipper:'精准 · 使对手对本次攻击的闪避率降低 12 个百分点。',
 carrot:'急救 · 自身生命低于 50% 时，命中后恢复最多 10 点生命。',
 fish:'盐渍 · 命中后，对手接下来两次受击的计算伤害各增加 3 点。',
 guitar:'封招 · 命中后，对手下一次主击命中无法触发连击功法。',
 rubber_duck:'分心 · 命中后，对手下一次主击被闪避的概率提高 12 个百分点。',
 lantern:'灯火 · 命中后，接下来两次命中各恢复最多 4 点生命。',
};
const battleStatusLabels = {numb:'手麻', shield:'护盾', opening:'破绽', focus:'专注',
 chill:'冰冷', soak:'浸湿', tailwind:'借风', salt:'盐渍', silence:'封招', distract:'分心', glow:'灯火'};
const battleEffectLabels = {...battleStatusLabels, numb_spent:'攻击减弱', shield_spent:'格挡',
 pierce:'破甲', execute:'斩杀加成', opening_hit:'开场重击', shatter:'碎盾', opening_spent:'破绽连击',
 cleanse:'清除减益', spatula_heal:'翻身回血', carrot_heal:'急救回血', glow_heal:'灯火回血',
 jab:'补拳', focus_spent:'专注生效', return_hit:'折返追击', chill_spent:'冰冷生效',
 soak_spent:'浸湿增伤', tailwind_spent:'借风生效', accurate:'精准', salt_spent:'盐渍增伤',
 silence_spent:'连击封锁', distract_spent:'分心生效'};
const mode = Object.hasOwn(weaponMoves, requestedDemo) ? requestedDemo : 'normal';
const demoAttack = onlineMode ? null : weaponMoves[mode];
const punch = {name:'挥出一拳', damage:10, icon:'✦'};
const maxHp = {left:100, right:100};
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

const currentMode = onlineMode ? $('online-link') : document.querySelector(`[data-mode="${mode}"]`);
currentMode?.setAttribute('aria-current', 'page');
if (!onlineMode) {
 const picker = $('weapon-demo-select');
 for (const [id, move] of Object.entries(weaponMoves)) picker.add(new Option(move.label, id));
 picker.value = mode;
 picker.addEventListener('change', () => { location.search = new URLSearchParams({demo:picker.value}); });
}
if (demoAttack) {
 $('demo-label').textContent = `${demoAttack.label}验收`;
 $('action-desc').textContent = demoAttack.description ?? `双方轮流使用${demoAttack.label}，演示「${demoAttack.name}」。`;
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
  for (const [frequency, volume, duration] of metalOvertones[weapon] ?? []) {
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
 impact.toggleAttribute('data-custom-weapon', Boolean(move.color));
 impact.style.setProperty('--weapon-color', move.color ?? '');
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
function reportWeaponDraw({number, attacker, move, drawsFromPool}) {
 if (!move.weapon) return;
 const action = drawsFromPool ? `抽到${move.label}` : move.draw;
 reportTurnEvent(number, `${fighterNames[attacker]}${action}！`);
}
function effectText(effect, names) {
 const name = names[effect.side];
 switch (effect.id) {
  case 'numb': return `${name}进入手麻状态，下一次命中伤害降低 25%。`;
  case 'numb_spent': return `${name}受手麻影响，这次命中少打 ${effect.amount} 点伤害。`;
  case 'shield': return `${name}获得护盾，可抵挡下一次命中的最多 ${effect.amount} 点伤害。`;
  case 'shield_spent': return `${name}的护盾抵挡了 ${effect.amount} 点伤害，护盾消失。`;
  case 'pierce': return `轩辕剑无视 ${name}的 ${effect.value} 点防御，增加 ${effect.amount} 点计算伤害。`;
  case 'execute': return `${name}生命低于 30%，青龙偃月刀追加 ${effect.amount} 点计算伤害。`;
  case 'shatter': return `玩具锤击碎了${name}的护盾，跳过本次护盾减伤。`;
  case 'opening_hit': return `${name}生命至少还有 70%，棒球棍额外打出 ${effect.amount} 点计算伤害。`;
  case 'opening': return `${name}露出破绽，对手下次具备连击条件时必定连击。`;
  case 'opening_spent': return `${name}的破绽被抓住，触发连击。`;
  case 'cleanse': return `${name}清除了${battleStatusLabels[effect.status]}。`;
  case 'spatula_heal': case 'carrot_heal': case 'glow_heal':
   return `${name}触发${battleEffectLabels[effect.id]}，恢复 ${effect.amount} 点生命，当前生命 ${effect.hp}。`;
  case 'jab': return `拳击手套对${name}追加一拳。`;
  case 'return_hit': return `回旋镖折返，追击${name}。`;
  case 'focus': return `${name}获得专注，下次主击命中的暴击率提高 20 个百分点。`;
  case 'focus_spent': return `${name}的专注生效，本次暴击率提高 ${effect.amount} 个百分点。`;
  case 'chill': return `${name}进入冰冷状态，下次主击命中无法暴击。`;
  case 'chill_spent': return `${name}受到冰冷影响，本次主击无法暴击。`;
  case 'soak': return `${name}被浸湿，下次受击的计算伤害增加 5 点。`;
  case 'soak_spent': return `${name}受到浸湿影响，本次计算伤害增加 ${effect.amount} 点。`;
  case 'tailwind': return `${name}获得借风，下次被主击时闪避率提高 18 个百分点。`;
  case 'tailwind_spent': return `${name}的借风生效，本次闪避率提高 ${effect.amount} 个百分点。`;
  case 'accurate': return `${name}触发精准，本次目标的闪避率降低 ${effect.amount} 个百分点。`;
  case 'salt': return `${name}沾上盐渍，接下来两次受击的计算伤害各增加 3 点。`;
  case 'salt_spent': return `${name}的盐渍使本次计算伤害增加 ${effect.amount} 点，还剩 ${effect.remaining} 次。`;
  case 'silence': return `${name}被封招，下次主击命中无法触发连击。`;
  case 'silence_spent': return `${name}的封招生效，本次主击不会触发连击。`;
  case 'distract': return `${name}进入分心状态，下次主击被闪避的概率提高 12 个百分点。`;
  case 'distract_spent': return `${name}受到分心影响，本次目标的闪避率提高 ${effect.amount} 个百分点。`;
  case 'glow': return `${name}获得灯火，接下来两次命中各恢复最多 4 点生命。`;
  case 'glow_spent': return `${name}消耗一层灯火，还剩 ${effect.remaining} 次。`;
  default: return '';
 }
}

function displayStatus(side, id, text) {
 const fighter = $(side);
 const list = $('status-' + side);
 let badge = list.querySelector(`[data-status="${id}"]`);
 fighter.classList.toggle('has-' + id, Boolean(text));
 if (!text) return badge?.remove();
 if (!badge) {
  badge = document.createElement('span');
  badge.className = 'battle-status ' + id;
  badge.dataset.status = id;
  list.append(badge);
 }
 badge.textContent = text;
}

function clearSideStatuses(side) {
 for (const badge of $('status-' + side).children) $(side).classList.remove('has-' + badge.dataset.status);
 $('status-' + side).replaceChildren();
}
function clearBattleStatuses() {
 for (const side of ['left', 'right']) {
  clearSideStatuses(side);
  $('effect-' + side).classList.remove('show');
 }
}

function showBattleEffects(events = []) {
 const callouts = {left:[], right:[]};
 for (const event of events) {
  for (const effect of event.effects ?? []) {
   const {id, side, amount} = effect;
   if (effect.status && Object.hasOwn(battleStatusLabels, effect.status)) {
    const count = effect.remaining > 1 ? ` ${effect.remaining}` : '';
    displayStatus(side, effect.status, effect.remaining ? battleStatusLabels[effect.status] + count : null);
   } else if (id === 'numb' || id === 'shield') {
    displayStatus(side, id, id === 'shield' ? `护盾 ${amount}` : '手麻');
   } else if (id === 'numb_spent' || id === 'shield_spent') {
    displayStatus(side, id === 'numb_spent' ? 'numb' : 'shield');
   }
   if (effect.hp != null) updateHp(side, effect.hp);
   const label = battleEffectLabels[id];
   if (label) {
    const suffix = effect.hp != null ? ` +${amount}` : amount != null && id !== 'chill_spent' ? ` ${amount}` : '';
    callouts[side].push({id, text:label + suffix});
   }
  }
  if (event.kind === 'knockout') {
   clearSideStatuses(event.target);
  }
 }
 for (const [side, callout] of Object.entries(callouts)) {
  if (!callout.length) continue;
  const element = $('effect-' + side);
  element.textContent = callout.map(effect => effect.text).join(' · ');
  element.dataset.effect = callout.at(-1).id;
  animate(element, 'show');
 }
}
function reportTurnResult({number, attacker, defender, move, dodge, damage, remainingHp, events}) {
 const name = fighterNames[attacker], target = fighterNames[defender];
 if (events) {
  for (const event of events) {
   const action = `${name}的【${event.source_name}·${event.move_name}】`;
   if (event.kind === 'knockout') reportTurnEvent(number, target + '倒下了！');
   if (event.kind === 'dodge') reportTurnEvent(number, action + '被' + target + '闪避。');
   if (event.kind === 'hit') {
    const hit = event.critical ? '暴击' : '命中';
    reportTurnEvent(number, `${action}${hit}，对${target}造成 ${event.damage} 点伤害，实际扣血 ${event.applied_damage}，剩余 ${event.remaining_hp} 血。`);
   }
   for (const effect of event.effects ?? []) {
    const text = effectText(effect, fighterNames);
    if (text) reportTurnEvent(number, text);
   }
  }
  return;
 }
 if (dodge) {
  const attack = move.label ? `用${move.label}使出「${move.name}」` : move.name;
  reportTurnEvent(number, name + attack + '，' + target + '灵巧地躲开了！');
  return;
 }
 const attackName = move.label ? `用${move.label}使出「${move.name}」` : move.name;
 reportTurnEvent(number, name + attackName + '，对' + target + '造成 ' + damage + ' 点伤害！');
 if (remainingHp === 0) reportTurnEvent(number, target + '倒下了！');
}
function showFloat(side, text) { const el = $('float-' + side); el.textContent = text; animate(el, 'show'); }
function updateHp(side, hp) {
 const fill = $('hp-' + side);
 const bar = fill.parentElement;
 const width = `${100 * hp / maxHp[side]}%`;
 bar.classList.toggle('is-damaged', hp < maxHp[side]);
 fill.style.width = width;
 bar.querySelector('.bar-ghost').style.width = width;
 $('hp-' + side + '-text').textContent = `${hp} / ${maxHp[side]}`;
}
function simulateBattle() {
 const hp = {left:100, right:100};
 const pools = {left:Object.values(weaponMoves), right:Object.values(weaponMoves)};
 const turns = [];
 while (hp.left > 0 && hp.right > 0) {
  const number = Math.floor(turns.length / 2) + 1;
  const attacker = turns.length % 2 === 0 ? 'left' : 'right';
  const defender = attacker === 'left' ? 'right' : 'left';
  const pool = pools[attacker];
  const move = demoAttack ?? pool.splice(Math.floor(Math.random() * pool.length), 1)[0] ?? punch;
  const dodge = !demoAttack && Math.random() < .16;
  const damage = dodge ? 0 : move.damage + Math.floor(Math.random() * 7);
  hp[defender] = Math.max(0, hp[defender] - damage);
  turns.push({number, attacker, defender, move, dodge, damage, remainingHp:hp[defender], drawsFromPool:!demoAttack});
 }
 return {turns, hp};
}
async function playTurns(turns) {
 for (const turn of turns) {
  await wait(850);
  if (skipping) return;
  const {number, attacker, defender, move, dodge, damage, remainingHp} = turn;
  $('round').textContent = `第 ${number} 回合${demoAttack ? ' · ' + demoAttack.label : ''}`;
  const attackerEl = $(attacker), defenderEl = $(defender);
  const melee = move.range !== 'ranged';
  const weaponClass = move.weapon && `using-${move.weapon}`;
  const custom = move.frames && prepareWeaponMove(attackerEl, move);
  if (weaponClass) {
   attackerEl.classList.add(weaponClass, 'drawing-weapon');
   reportWeaponDraw(turn);
   if (custom) await custom.draw();
   else await wait(550);
   if (skipping) return;
   attackerEl.classList.remove('drawing-weapon');
  }
  const distance = melee ? await moveToOpponent(attackerEl, defenderEl, move) : 0;
  if (skipping) return;
  if (custom) await custom.strike();
  else {
   attackerEl.classList.add('striking');
   await wait(move.windUp ?? 315);
  }
  if (skipping) return;
  const finishFlight = move.flight && await launchWeapon(move, custom.prop, defenderEl);
  if (skipping) return;
  const showHit = (amount, hp, attack = move) => {
   if (amount > 0) animate(defenderEl, 'hit');
   showFloat(defender, amount > 0 ? '−' + amount : '抵挡');
   impactAt(attackerEl, defenderEl, melee, attack);
   updateHp(defender, hp);
   if (hp === 0) defenderEl.classList.add('defeated');
  };
  const hits = turn.events;
  if (dodge) {
   animate(defenderEl, 'dodge');
   showFloat(defender, '闪避！');
  } else if (!hits) {
   showHit(damage, remainingHp);
  }
  if (hits?.length) {
   if (hits[0].kind === 'hit') showHit(hits[0].applied_damage, hits[0].remaining_hp);
   showBattleEffects([hits[0]]);
  }
  reportTurnResult(turn);
  const returningHit = hits?.some(event => event.effects?.some(effect => effect.id === 'return_hit'));
  if (finishFlight && !returningHit) await finishFlight();
  if (skipping) return;
  for (const event of hits?.slice(1) ?? []) {
   if (event.kind === 'hit') {
    await wait(260);
    if (skipping) return;
    defenderEl.classList.remove('dodge');
    showHit(event.applied_damage, event.remaining_hp, returningHit ? move : punch);
   }
   showBattleEffects([event]);
  }
  if (finishFlight && returningHit) await finishFlight();
  if (skipping) return;
  if (!dodge) {
   if (custom) await wait(demoAttack ? 220 : 85);
   else await hitPause(attackerEl, demoAttack ? 320 : 85);
   if (skipping) return;
  }
  if (custom) await custom.recover();
  else await wait(400);
  if (skipping) return;
  attackerEl.classList.remove('striking');
  if (melee) await returnToPlace(attackerEl, distance);
  if (skipping) return;
  if (weaponClass) attackerEl.classList.remove(weaponClass);
  if (custom) clearWeaponProps(attackerEl);
 }
 await wait(700);
}
function clearWeaponProps(fighter) {
 fighter.classList.remove('custom-weapon');
 fighter.querySelectorAll('.custom-weapon-prop').forEach(prop => prop.remove());
 for (const animation of fighter.querySelector('.fighter-art').getAnimations()) {
  if (!(animation instanceof CSSAnimation)) animation.cancel();
 }
}
function showSkippedOutcome(hp, turns) {
 game.classList.add('is-skipped');
 const weaponClasses = Object.keys(weaponMoves).map(weapon => `using-${weapon}`);
 arena.querySelectorAll('.weapon-projectile, .weapon-tether').forEach(prop => prop.remove());
 for (const side of Object.keys(hp)) {
  const fighter = $(side);
  fighter.classList.remove('striking', 'drawing-weapon', 'dragging-blade', 'hit', 'dodge', ...weaponClasses);
  clearWeaponProps(fighter);
  clearMovement(fighter);
  fighter.classList.toggle('defeated', hp[side] === 0);
  $('float-' + side).classList.remove('show');
  updateHp(side, hp[side]);
 }
 arena.classList.remove('shake');
 clearBattleStatuses();
 $('impact').classList.remove('show');
 $('dust').classList.remove('show');
 logs.replaceChildren();
 say(battleOpening);
 for (const turn of turns) {
  reportWeaponDraw(turn);
  reportTurnResult(turn);
 }
 say('已跳过剩余战斗动画。');
 logs.scrollTop = 0;
}
function showDamageTotals(totals) {
 const list = $('damage-totals');
 list.replaceChildren();
 for (const total of totals ?? []) {
  const item = document.createElement('li');
  item.textContent = `${fighterNames[total.actor]} · ${total.name} · ${total.damage} 点实际扣血`;
  list.append(item);
 }
 $('damage-stats').hidden = !totals?.length;
}

async function playBattle({turns, hp, winner, players, damageTotals, rewardText}) {
 if (running) return;
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
 showDamageTotals(null);
 clearBattleStatuses();
 for (const side of Object.keys(hp)) {
  $(side).classList.remove('defeated');
  if (players) {
   fighterNames[side] = players[side].name;
   maxHp[side] = players[side].max_hp;
   $('name-' + side).textContent = fighterNames[side];
   $(side).querySelector('.fighter-art').setAttribute('aria-label', fighterNames[side]);
  }
  updateHp(side, maxHp[side]);
 }
 say(battleOpening);
 await playTurns(turns);
 if (skipping) showSkippedOutcome(hp, turns);
 else clearBattleStatuses();
 const winningSide = winner ?? (hp.left > 0 ? 'left' : 'right');
 const title = winningSide === 'draw' ? '平局' : fighterNames[winningSide] + '获胜！';
 const completedRounds = Math.floor(turns.length / 2);
 const incompleteRound = turns.length % 2 === 1;
 if (incompleteRound) {
  const lastTurn = turns.at(-1);
  reportTurnEvent(lastTurn.number, `${fighterNames[lastTurn.defender]}未出手，本回合未打完。`);
 }
 $('round').textContent = '战斗结束';
 $('winner').textContent = title;
 $('result-text').textContent = incompleteRound
  ? `打完 ${completedRounds} 回合，第 ${completedRounds + 1} 回合提前结束。`
  : `打完 ${completedRounds} 回合。`;
 $('battle-reward').textContent = rewardText ?? '';
 $('battle-reward').hidden = !rewardText;
 say('🎉 ' + title);
 showDamageTotals(damageTotals);
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
if (!onlineMode) {
 const battle = () => playBattle(simulateBattle());
 start.addEventListener('click', battle);
 again.addEventListener('click', battle);
}
skip.addEventListener('click', () => {
 if (!running || skipping) return;
 skipping = true;
 // Release the active playback waits so the precomputed result can render.
 for (const animation of battleAnimations) animation.finish();
});

$('sound').addEventListener('click', () => { soundEnabled = !soundEnabled; $('sound').textContent = soundEnabled ? '🔊 音效开' : '🔇 音效关'; $('sound').setAttribute('aria-pressed', String(soundEnabled)); $('sound').setAttribute('aria-label', soundEnabled ? '关闭音效' : '开启音效'); if (soundEnabled) prepareSound(); });
