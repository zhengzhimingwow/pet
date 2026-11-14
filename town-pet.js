(() => {
 if (!onlineMode) return;
 const stage = $('town-stage');
 const lobby = $('account-lobby');
 const pet = stage.querySelector('.town-pet');
 const pose = pet.querySelector('.town-pet-pose');
 const art = pet.querySelector('.town-pet-art');
 const feet = pet.querySelectorAll('.town-pet-foot');
 const shadow = pet.querySelector('.town-pet-shadow');
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 const actions = [
  ['rest', 1.35], ['walk'], ['crouch', .95], ['jump', .83], ['rest', 1.1],
  ['turn', .35], ['walk'], ['rest', 2.1], ['turn', .35],
 ];
 const cycle = .63;
 const stride = .33;
 let action = 0;
 let elapsed = 0;
 let total = 0;
 let direction = 1;
 let position;
 let frame;
 let lastTime;
 let step;
 let width;
 let walkDistance;

 function measure() {
  width = pet.offsetWidth;
  const runway = Math.max(0, stage.clientWidth - width);
  walkDistance = Math.min(runway * .65, width * 2.15);
  step = width * stride;
  if (width && position === undefined) position = -walkDistance / 2;
 }

 function smooth(t) { return t * t * (3 - 2 * t); }

 function draw(now) {
  if (!width) measure();
  const dt = lastTime === undefined ? 0 : Math.min(.05, (now - lastTime) / 1000);
  lastTime = now;
  total += dt;
  elapsed += dt;
  const [name, duration = (step ? walkDistance / step * cycle : 0) + .3] = actions[action];
  const t = Math.min(1, elapsed / duration);
  let x = position;
  let lift = 0;
  let squash = 0;
  let tilt = 0;
  let turn = direction === 1 ? 0 : 180;
  let footOffsets = [[0, 0], [0, 0]];
  if (name === 'walk') {
   // Ease in and out over the first and last step. Match the planted foot's speed to the walk.
   const ramp = Math.min(.23, duration / 4);
   const travelTime = Math.max(0, Math.min(duration - ramp, elapsed - ramp / 2));
   const travel = elapsed < ramp ? elapsed ** 2 / (2 * ramp)
    : elapsed > duration - ramp ? duration - ramp - Math.max(0, duration - elapsed) ** 2 / (2 * ramp)
    : travelTime;
   const distance = walkDistance * travel / (duration - ramp);
   x += direction * distance;
   const pace = Math.min(1, elapsed / ramp, Math.max(0, duration - elapsed) / ramp);
   const gait = step ? distance / step : 0;
   footOffsets = [0, .5].map(offset => {
    const phase = (gait + offset) % 1;
    if (phase < .5) return [(.25 - phase) * stride * 100 * pace, 0];
    const swing = (phase - .5) * 2;
    return [(smooth(swing) - .5) * stride * 50 * pace, -7 * Math.sin(Math.PI * swing) * pace];
   });
   lift = 1.7 * (1 - Math.cos(4 * Math.PI * gait)) * pace;
   tilt = 3.8 * Math.sin(2 * Math.PI * gait) * pace + pace * 1.8;
  } else if (name === 'crouch') {
   squash = .15 * Math.min(smooth(Math.min(1, t / .3)), smooth(Math.min(1, (1 - t) / .38)));
   tilt = 11 * squash;
  } else if (name === 'jump') {
   const flight = (t - .21) / .55;
   if (flight <= 0) squash = .16 * Math.sin(Math.PI * t / .21);
   else if (flight < 1) {
    lift = 104 * flight * (1 - flight);
    squash = -.065 * Math.sin(Math.PI * flight);
    tilt = 7 * Math.sin(2 * Math.PI * flight);
    footOffsets = [[-3 * lift / 26, -4 * lift / 26], [4 * lift / 26, -2 * lift / 26]];
   } else {
    squash = .12 * Math.sin(Math.PI * (t - .76) / .24);
   }
  } else if (name === 'turn') {
   turn += 180 * smooth(t);
   squash = .055 * Math.sin(Math.PI * t);
  } else {
   squash = -.017 * Math.sin(2 * Math.PI * t);
   tilt = 2 * Math.sin(2 * Math.PI * t);
  }
  pet.style.translate = `calc(-50% + ${x}px) 0`;
  pose.style.transform = `translateY(${-lift}%) rotateY(${turn}deg)`;
  art.style.transform = `rotate(${tilt}deg) scale(${1 + squash * .45}, ${1 - squash})`;
  art.toggleAttribute('data-blink', total % 3.7 > 3.57);
  feet.forEach((foot, i) => { foot.style.translate = `${footOffsets[i][0]}% ${footOffsets[i][1]}%`; });
  shadow.style.scale = String(1 - lift / 100);
  shadow.style.opacity = String(1 - lift / 60);

  if (t === 1) {
   if (name === 'walk') position = x;
   if (name === 'turn') direction *= -1;
   action = (action + 1) % actions.length;
   elapsed = 0;
  }
  frame = requestAnimationFrame(draw);
 }

 function update() {
  cancelAnimationFrame(frame);
  lastTime = undefined;
  if (lobby.hidden || stage.hidden || document.hidden) return;
  if (!motion.matches) {
   measure();
   frame = requestAnimationFrame(draw);
  } else {
   for (const part of [pet, pose, art, ...feet, shadow]) part.removeAttribute('style');
   art.removeAttribute('data-blink');
   action = elapsed = total = 0;
   direction = 1;
   position = undefined;
  }
 }

 const visibility = new MutationObserver(update);
 for (const element of [stage, lobby]) visibility.observe(element, {attributes:true, attributeFilter:['hidden']});
 new ResizeObserver(() => {
  if (!stage.clientWidth) return;
  const previous = walkDistance;
  measure();
  if (previous && position !== undefined) position *= walkDistance / previous;
 }).observe(stage);
 document.addEventListener('visibilitychange', update);
 motion.addEventListener('change', update);
 update();
})();
