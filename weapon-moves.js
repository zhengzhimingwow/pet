// Frame format: [time, hand X, hand Y, prop angle, body lean, body lift].
// Coordinates face right and are mirrored by the fighter sprite for the other side.
const customWeaponMoves = {
 hammer: {
  label:'玩具锤', icon:'🔨', name:'蓄力砸地', damage:24, spacing:.88, approachDuration:520, windUp:620, color:'#ffc14d',
  frames:[[0,18,0,-35,-6,0],[.32,1,-74,-104,-12,0],[.75,10,-80,-111,-8,-4],[1,75,42,88,17,9]],
 },
 bat: {
  label:'棒球棍', icon:'🏏', name:'全垒打', damage:22, spacing:.90, windUp:420, color:'#ffac74',
  frames:[[0,20,5,-18,0,0],[.48,-38,-24,-133,-16,0],[.78,4,-12,-78,-9,0],[1,84,-6,30,17,0]],
 },
 umbrella: {
  label:'雨伞', icon:'☂️', name:'撑伞横推', damage:18, spacing:.94, windUp:465, color:'#80d1ff',
  frames:[[0,22,12,-25,0,0],[.34,44,10,-79,-6,0],[.62,49,-17,-92,-3,0],[1,85,3,-88,11,0]],
 },
 broom: {
  label:'扫帚', icon:'🧹', name:'低位扫腿', damage:19, spacing:.91, windUp:440, color:'#e6bb73',
  frames:[[0,22,2,24,0,0],[.4,-27,33,109,-8,9],[.68,36,40,69,4,11],[1,91,30,-42,14,7]],
 },
 spatula: {
  label:'锅铲', icon:'🍴', prop:'铲', name:'翻锅上挑', damage:17, spacing:.84, windUp:340, color:'#c9e8ff',
  frames:[[0,17,15,40,0,0],[.48,31,44,80,13,8],[.72,58,17,26,5,0],[1,76,-44,-41,-10,-12]],
 },
 boxing: {
  label:'拳击手套', icon:'🥊', name:'双拳连打', damage:20, spacing:.82, windUp:430, color:'#ff7575', twin:true,
  frames:[[0,31,-9,5,0,0],[.28,79,-14,-20,13,-5],[.56,18,7,11,-6,0],[.75,29,-2,0,0,-2],[1,82,-3,-12,16,0]],
 },
 yo_yo: {
  label:'悠悠球', icon:'🪀', name:'放线回抽', damage:19, range:'ranged', windUp:410, color:'#f091e6',
  frames:[[0,24,10,12,0,0],[.4,15,26,-26,-10,3],[.76,37,-9,35,3,0],[1,68,0,74,9,0]],
  flight:{duration:510, arc:12, spin:720, returns:true, tether:true},
 },
 boomerang: {
  label:'回旋镖', icon:'🪃', name:'旋飞折返', damage:20, range:'ranged', windUp:390, color:'#ffd577',
  frames:[[0,19,0,-12,0,0],[.48,-32,-48,-89,-12,-3],[.78,18,-35,10,3,0],[1,65,-15,52,15,0]],
  flight:{duration:560, arc:74, spin:1080, returns:true},
 },
 snowball: {
  label:'雪球', icon:'❄️', projectile:'●', name:'抛雪球', damage:18, range:'ranged', windUp:480, color:'#e0f6ff',
  frames:[[0,19,11,0,0,0],[.5,-15,-55,0,-13,-2],[.72,8,-72,0,-5,-12],[1,55,-27,0,16,-9]],
  flight:{duration:500, arc:105, spin:90},
 },
 water: {
  label:'水枪', icon:'🔫', projectile:'💧', name:'连射水弹', damage:18, range:'ranged', windUp:360, color:'#5bd6ff',
  frames:[[0,25,18,24,0,0],[.46,57,-7,-13,-5,0],[.72,43,-14,-26,-8,0],[1,69,-4,-9,8,0]],
  flight:{duration:380, arc:4, spin:0, bursts:3, gap:70},
 },
 fan: {
  label:'折扇', icon:'🪭', projectile:'〰', name:'挥扇风刃', damage:19, range:'ranged', windUp:465, color:'#94f6cf',
  frames:[[0,18,12,-15,0,0],[.38,23,-47,-51,-9,0],[.7,-9,-33,-100,-5,-2],[1,69,-7,37,14,0]],
  flight:{duration:500, arc:28, spin:32, wide:true},
 },
 slipper: {
  label:'拖鞋', icon:'🩴', name:'反手拍', damage:17, spacing:.82, windUp:275, color:'#f5a4d9',
  frames:[[0,17,11,28,0,0],[.48,-29,-7,-65,-15,0],[.76,29,-19,27,-1,0],[1,78,-10,125,16,0]],
 },
 carrot: {
  label:'胡萝卜', icon:'🥕', name:'跳起劈砸', damage:21, spacing:.84, windUp:560, color:'#ffab54',
  frames:[[0,20,10,15,0,6],[.38,8,-46,-110,-8,-35],[.68,23,-53,-65,6,-44],[1,71,19,54,19,4]],
 },
 fish: {
  label:'咸鱼', icon:'🐟', name:'甩尾抽打', damage:20, spacing:.88, windUp:390, color:'#7fdbef',
  frames:[[0,17,12,13,0,0],[.34,-24,-4,-125,-13,0],[.64,32,27,-35,8,6],[1,84,4,115,15,0]],
 },
 guitar: {
  label:'吉他', icon:'🎸', projectile:'♫', name:'重拨音浪', damage:22, range:'ranged', windUp:540, color:'#eea7ff',
  frames:[[0,27,8,20,0,0],[.3,43,-4,-22,-12,0],[.6,22,8,26,9,-8],[1,52,1,-13,-5,0]],
  flight:{duration:540, arc:22, spin:-26, bursts:2, gap:110, wide:true},
 },
 rubber_duck: {
  label:'橡皮鸭', icon:'🐤', name:'弹跳投掷', damage:19, range:'ranged', windUp:385, color:'#ffe165',
  frames:[[0,20,17,-7,0,0],[.4,29,31,-16,12,12],[.66,41,19,18,5,4],[1,62,6,7,13,-4]],
  flight:{duration:630, arc:60, spin:160, bounce:true},
 },
 lantern: {
  label:'灯笼', icon:'🏮', name:'绕身回摆', damage:21, spacing:.92, windUp:545, color:'#ff8464',
  frames:[[0,18,25,0,0,0],[.26,5,-45,-45,-12,0],[.52,-30,-13,-112,-8,-4],[.76,24,36,-200,7,6],[1,88,-1,-352,13,0]],
 },
};
for (const [weapon, move] of Object.entries(customWeaponMoves)) {
 move.weapon = weapon;
 move.draw = '拿出' + move.label;
}

function weaponProp(move, art) {
 const prop = document.createElement('span');
 prop.className = 'custom-weapon-prop';
 prop.dataset.weapon = move.weapon;
 prop.setAttribute('aria-hidden', 'true');
 prop.textContent = move.prop ?? move.icon;
 art.append(prop);
 return prop;
}

function propPose([offset, x, y, angle]) {
 return {offset, transform:`translate(${x}%, ${y}%) rotate(${angle}deg)`};
}

function prepareWeaponMove(fighter, move) {
 const art = fighter.querySelector('.fighter-art');
 const prop = weaponProp(move, art);
 const offhand = move.twin ? weaponProp(move, art) : null;
 const direction = fighter.classList.contains('left') ? 1 : -1;
 const first = propPose(move.frames[0]).transform;
 const last = propPose(move.frames.at(-1)).transform;
 fighter.classList.add('custom-weapon');
 prop.style.transform = first;
 if (offhand) offhand.style.transform = 'translate(-8%, 12%) rotate(-24deg) scale(.8)';
 return {
  async draw() {
   await playBattleAnimation(prop, [
    {opacity:0, transform:'translate(-30%, 30%) scale(.45)'},
    {opacity:1, transform:first},
   ], {duration:440, easing:'ease-out'});
  },
  async strike() {
   const propMotion = playBattleAnimation(prop, move.frames.map(propPose), move.windUp);
   const bodyMotion = playBattleAnimation(art, move.frames.map(([offset, , , , lean, lift]) => ({
    offset, rotate:`${lean * direction}deg`, translate:`0 ${lift / 2}%`,
   })), {duration:move.windUp, fill:'forwards'});
   const offhandMotion = offhand && playBattleAnimation(offhand, [
    {offset:0, transform:'translate(-8%, 12%) rotate(-24deg) scale(.8)'},
    {offset:.36, transform:'translate(9%, 10%) rotate(-18deg) scale(.8)'},
    {offset:.74, transform:'translate(90%, 2%) rotate(-8deg) scale(.9)'},
    {offset:1, transform:'translate(-8%, 12%) rotate(-24deg) scale(.8)'},
   ], move.windUp);
   await Promise.all([propMotion, bodyMotion, offhandMotion]);
   prop.style.transform = last;
  },
  async recover() {
   const lean = move.frames.at(-1)[4] * direction;
   const lift = move.frames.at(-1)[5] / 2;
   await Promise.all([
    playBattleAnimation(prop, [{transform:last}, {transform:first}], 180),
    playBattleAnimation(art, [{rotate:`${lean}deg`, translate:`0 ${lift}%`}, {rotate:'0deg', translate:'0 0'}], 180),
   ]);
   prop.style.transform = first;
   clear();
  },
  prop,
 };
 function clear() {
  for (const animation of art.getAnimations()) {
   if (animation.playState === 'finished' && animation.effect.target === art) animation.cancel();
  }
 }
}

async function launchWeapon(move, prop, defender) {
 const {flight} = move;
 const field = arena.getBoundingClientRect();
 const hand = prop.getBoundingClientRect();
 const target = fighterPosition(defender);
 const x = hand.left + hand.width / 2 - field.left;
 const y = hand.top + hand.height / 2 - field.top;
 const dx = target.x - field.left - x;
 const dy = target.y - field.top - y;
 const sign = Math.sign(dx);
 const arc = Math.min(flight.arc, Math.max(12, y - 26));
 const thrown = !move.projectile || move.weapon === 'snowball';
 if (thrown) prop.style.visibility = 'hidden';
 const projectiles = Array.from({length:flight.bursts ?? 1}, (_, index) => {
  const particle = document.createElement('span');
  particle.className = 'weapon-projectile';
  particle.dataset.weapon = move.weapon;
  particle.textContent = move.projectile ?? move.icon;
  particle.style.cssText = `left:${x}px;top:${y}px;--weapon-color:${move.color}`;
  particle.setAttribute('aria-hidden', 'true');
  arena.append(particle);
  const tether = flight.tether ? document.createElement('span') : null;
  if (tether) {
   tether.className = 'weapon-tether';
   tether.style.cssText = `left:${x}px;top:${y}px;width:${Math.hypot(dx, dy)}px;rotate:${Math.atan2(dy, dx)}rad`;
   tether.setAttribute('aria-hidden', 'true');
   arena.append(tether);
  }
  const path = flight.bounce
   ? [[0,0,0],[.33,.34,-arc],[.58,.58,dy+35],[.79,.81,dy-30],[1,1,dy]]
   : [[0,0,0],[.5,.5,dy/2-arc],[1,1,dy]];
  const frames = path.map(([offset, distance, height]) => ({
   offset, opacity:1, transform:`translate(${dx * distance}px, ${height + (offset === 1 ? 0 : index * 9)}px) rotate(${flight.spin * distance * sign}deg) scale(${flight.wide ? .65 + distance : 1})`,
  }));
  const delay = index * (flight.gap ?? 0);
  const out = playBattleAnimation(particle, frames, {duration:flight.duration, delay, fill:'forwards'});
  if (tether) playBattleAnimation(tether, [{scale:'0 1'}, {scale:'1 1'}], {duration:flight.duration, fill:'forwards'});
  return {particle, tether, frames, out};
 });
 await projectiles[0].out;
 return async () => {
  try {
   if (!skipping) await Promise.all(projectiles.map(async ({particle, tether, frames, out}) => {
    await out;
    if (!flight.returns || skipping) return;
    const returning = frames.map(({offset, ...frame}) => ({...frame, offset:1 - offset})).reverse();
    if (tether) playBattleAnimation(tether, [{scale:'1 1'}, {scale:'0 1'}], {duration:270, fill:'forwards'});
    await playBattleAnimation(particle, returning, {duration:270, fill:'forwards'});
   }));
  } finally {
   projectiles.forEach(({particle, tether}) => { particle.remove(); tether?.remove(); });
   if (flight.returns) prop.style.visibility = '';
  }
 };
}
