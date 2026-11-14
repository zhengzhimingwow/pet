const byId = id => document.getElementById(id);
const workspace = byId('gm-workspace');
const playerPanel = byId('gm-player');
const loginPanel = byId('gm-login-panel');
const loginForm = byId('gm-login');
const lookupForm = byId('gm-lookup');
const grantForm = byId('gm-grant');
const zoneInput = byId('gm-zone');
const uidInput = byId('gm-uid');
const kindInput = byId('gm-kind');
const assetInput = byId('gm-asset');
const quantityInput = byId('gm-quantity');
const reasonInput = byId('gm-reason');
const confirmDialog = byId('gm-confirm');
const logoutButton = byId('gm-logout');
const status = byId('gm-feedback');
const timeFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone:'Asia/Shanghai', dateStyle:'short', timeStyle:'medium',
});
const errors = {
  unauthorized:'GM 口令错误或已更换，请重新输入。',
  not_found:'该区服没有找到这个 UID 的角色。',
  invalid_request:'请检查 UID、发放内容、数量和原因。',
  already_owned:'角色已经拥有这把武器。',
  request_conflict:'此申请编号已使用，请重新核对。',
  rate_limited:'操作太快，请稍后再试。',
};

let token = '';
let catalog;
let target;
let result;
let proposed;
let pending;
let busy = false;

async function request(zone, path, body) {
  const response = await fetch(`/api/zone/${zone}/gm/${path}`, {
    method:body ? 'POST' : 'GET',
    headers:{Authorization:`Bearer ${token}`, ...(body ? {'Content-Type':'application/json'} : {})},
    body:body ? JSON.stringify(body) : undefined,
    cache:'no-store',
  });
  if (response.status === 429) throw Object.assign(new Error(), {code:'rate_limited'});
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(), {code:data.error});
  return data;
}

function notify(message, error = false) {
  status.textContent = message;
  status.toggleAttribute('data-error', error);
}

function clearPlayer() {
  target = result = null;
  playerPanel.hidden = true;
}

function logout() {
  token = '';
  catalog = pending = proposed = null;
  clearPlayer();
  lookupForm.reset();
  grantForm.reset();
  loginForm.reset();
  workspace.hidden = logoutButton.hidden = true;
  loginPanel.hidden = false;
}

async function run(action, focus) {
  if (busy) return;
  busy = true;
  const controls = [...document.querySelectorAll('form input, form select, form button, #gm-logout')];
  controls.forEach(control => control.disabled = true);
  notify('');
  try {
    await action();
  } catch (error) {
    if (error.code === 'unauthorized') {
      logout();
      focus = byId('gm-key');
    }
    notify(errors[error.code] ?? '暂时无法确认操作结果。请稍后重试。', true);
  } finally {
    controls.forEach(control => control.disabled = false);
    if (result) updateAssetControls();
    busy = false;
    focus?.focus();
  }
}

function assetName(kind, id) {
  const list = kind === 'weapon' ? catalog.weapons : catalog.items;
  return list.find(asset => asset.id === id)?.name ?? id;
}

function showPlayer(data) {
  result = data;
  byId('gm-player-name').textContent = data.player.name;
  byId('gm-player-meta').textContent = `${target.zone} 服 · UID ${target.id} · Lv. ${data.progression.level}`;
  byId('gm-items').textContent = data.inventory.items.map(item =>
    `${assetName('item', item.item_id)} × ${item.quantity}`).join('、') || '空';
  byId('gm-weapons').textContent = data.progression.weapons.map(id => assetName('weapon', id)).join('、') || '空';
  const history = byId('gm-history');
  history.replaceChildren(...data.grants.map(grant => {
    const row = document.createElement('tr');
    const values = [timeFormat.format(Number(grant.created_at_epoch) * 1000),
      `${assetName(grant.kind, grant.asset_id)} × ${grant.quantity}`, grant.reason];
    for (const value of values) row.insertCell().textContent = value;
    return row;
  }));
  byId('gm-history-empty').hidden = data.grants.length > 0;
  byId('gm-history-table').hidden = !data.grants.length;
  playerPanel.hidden = false;
}

function updateAssetControls() {
  const weapon = kindInput.value === 'weapon';
  const list = weapon ? catalog.weapons : catalog.items;
  const selected = assetInput.value;
  const owned = new Set(result.progression.weapons);
  assetInput.replaceChildren(...list.map(asset => {
    const hasWeapon = weapon && owned.has(asset.id);
    const option = new Option(hasWeapon ? `${asset.name}（已拥有）` : asset.name, asset.id);
    option.disabled = hasWeapon;
    return option;
  }));
  const available = [...assetInput.options].filter(option => !option.disabled);
  assetInput.value = available.find(option => option.value === selected)?.value ?? available[0]?.value ?? '';
  document.querySelector('label[for="gm-asset"]').textContent = weapon ? '选择武器' : '选择道具';
  quantityInput.readOnly = weapon;
  if (weapon) quantityInput.value = '1';
  grantForm.querySelector('button[type="submit"]').disabled = !available.length;
}

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    token = byId('gm-key').value.trim();
    catalog = await request(1, 'catalog');
    loginForm.reset();
    zoneInput.replaceChildren(...catalog.zones.map(zone => new Option(zone.name, zone.id)));
    loginPanel.hidden = true;
    workspace.hidden = logoutButton.hidden = false;
  }, uidInput);
});
logoutButton.addEventListener('click', () => {
  logout();
  notify('');
  byId('gm-key').focus();
});
uidInput.addEventListener('input', clearPlayer);
zoneInput.addEventListener('change', clearPlayer);
kindInput.addEventListener('change', updateAssetControls);

lookupForm.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    clearPlayer();
    const query = {zone:zoneInput.value, id:uidInput.value};
    const data = await request(query.zone, `players/${query.id}`);
    target = query;
    showPlayer(data);
  }, byId('gm-player-name'));
});

grantForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!target || busy) return;
  if (!reasonInput.value.trim()) {
    notify('请输入发放原因。', true);
    reasonInput.focus();
    return;
  }
  const body = {
    player_id:target.id, kind:kindInput.value, asset_id:assetInput.value,
    quantity:Number(quantityInput.value), reason:reasonInput.value.trim(),
  };
  const key = JSON.stringify([target.zone, body]);
  const requestId = pending?.key === key ? pending.requestId
    : Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
  proposed = {key, requestId, zone:target.zone, body};
  const asset = assetName(body.kind, body.asset_id);
  byId('gm-confirm-text').textContent = `向 ${target.zone} 服的「${result.player.name}」（UID ${target.id}）发放 ${asset} × ${body.quantity}？`;
  confirmDialog.showModal();
});

byId('gm-cancel').addEventListener('click', () => confirmDialog.close());
byId('gm-send').addEventListener('click', () => {
  if (!confirmDialog.open || busy) return;
  const grant = proposed;
  confirmDialog.close();
  run(async () => {
    pending = grant;
    let data;
    try {
      data = await request(grant.zone, 'grants', {...grant.body, request_id:grant.requestId});
    } catch (error) {
      if (error.code && error.code !== 'unavailable' && error.code !== 'rate_limited') pending = null;
      throw error;
    }
    pending = null;
    showPlayer(data);
    reasonInput.value = '';
    notify(`已向「${data.player.name}」发放 ${assetName(grant.body.kind, grant.body.asset_id)} × ${grant.body.quantity}。`);
  }, byId('gm-player-name'));
});
