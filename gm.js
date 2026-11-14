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
const usernameInput = byId('gm-username');
const management = byId('gm-management');
const passwordDialog = byId('gm-password-dialog');
const passwordForm = byId('gm-password-form');
const roleLabels = {admin:'管理员', operator:'发放员', viewer:'只读'};
const status = byId('gm-feedback');
const timeFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone:'Asia/Shanghai', dateStyle:'short', timeStyle:'medium',
});
const errors = {
  unauthorized:'登录已失效，请重新登录。',
  invalid_credentials:'账号或密码错误，或账号已停用。',
  forbidden:'当前账号没有操作权限。',
  not_found:'没有找到对应的角色或账号。',
  invalid_request:'请检查填写内容。GM 账号使用 3–32 位字母、数字或下划线，密码至少 12 个字符且不超过 128 字节。',
  account_taken:'这个 GM 账号已存在。',
  self_management:'请用「修改密码」管理自己的密码。',
  already_owned:'角色已经拥有这把武器。',
  request_conflict:'此申请编号已使用，请重新核对。',
  rate_limited:'操作太快，请稍后再试。',
};

let actor;
let catalog;
let target;
let result;
let proposed;
let pending;
let busy = false;

async function request(zone, path, body) {
  const prefix = zone == null ? '/api/account/gm/' : `/api/zone/${zone}/gm/`;
  const response = await fetch(prefix + path, {
    method:body ? 'POST' : 'GET',
    headers:body ? {'Content-Type':'application/json'} : {},
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
  actor = catalog = pending = proposed = null;
  clearPlayer();
  lookupForm.reset();
  grantForm.reset();
  loginForm.reset();
  byId('gm-account-list').replaceChildren();
  management.open = false;
  workspace.hidden = byId('gm-user-controls').hidden = true;
  loginPanel.hidden = false;
}

async function run(action, focus) {
  if (busy) return;
  busy = true;
  const controls = [...document.querySelectorAll('form input, form select, form button, #gm-user-controls button, #gm-account-list button, #gm-account-list select')]
    .filter(control => !control.disabled);
  controls.forEach(control => control.disabled = true);
  notify('');
  try {
    await action();
  } catch (error) {
    if (error.code === 'unauthorized') {
      logout();
      if (passwordDialog.open) passwordDialog.close();
      focus = usernameInput;
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
      `${assetName(grant.kind, grant.asset_id)} × ${grant.quantity}`, grant.operator ?? '旧版 GM', grant.reason];
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

async function showWorkspace(account) {
  catalog = await request(1, 'catalog');
  actor = account;
  loginForm.reset();
  zoneInput.replaceChildren(...catalog.zones.map(zone => new Option(zone.name, zone.id)));
  byId('gm-identity').textContent = `${actor.username} · ${roleLabels[actor.role]}`;
  management.hidden = actor.role !== 'admin';
  byId('gm-grant-panel').hidden = actor.role === 'viewer';
  loginPanel.hidden = true;
  workspace.hidden = byId('gm-user-controls').hidden = false;
}

loginForm.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => showWorkspace(await request(null, 'login', {
    username:usernameInput.value.trim().toLowerCase(), password:byId('gm-key').value,
  })), uidInput);
});
logoutButton.addEventListener('click', () => run(async () => {
  await request(null, 'logout', {});
  logout();
}, usernameInput));

function accountAction(body, message) {
  return run(async () => {
    showAccounts((await request(null, 'accounts', body)).accounts);
    notify(message);
  });
}

function showAccounts(accounts) {
  byId('gm-account-list').replaceChildren(...accounts.map(account => {
    const row = document.createElement('tr');
    const name = row.insertCell();
    name.textContent = account.username;
    const role = row.insertCell();
    const state = row.insertCell();
    state.textContent = account.enabled ? '启用' : '停用';
    const cell = row.insertCell();
    if (account.username === actor.username) {
      role.textContent = roleLabels[account.role];
      cell.textContent = '当前账号';
      return row;
    }
    const select = document.createElement('select');
    select.setAttribute('aria-label', `${account.username} 的权限`);
    select.append(...Object.entries(roleLabels).map(([id, label]) => new Option(label, id)));
    select.value = account.role;
    role.append(select);
    const buttons = document.createElement('div');
    buttons.className = 'gm-account-actions';
    const addButton = (label, action) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary';
      button.textContent = label;
      button.addEventListener('click', action);
      buttons.append(button);
    };
    const update = (role, enabled) => accountAction({
      action:'update', username:account.username, role, enabled,
    }, `已更新 ${account.username}。`);
    addButton('保存权限', () => {
      if (select.value !== account.role) update(select.value, account.enabled);
    });
    addButton(account.enabled ? '停用' : '启用', () => update(account.role, !account.enabled));
    addButton('重设密码', () => openPassword(account.username));
    cell.append(buttons);
    return row;
  }));
}

management.addEventListener('toggle', () => {
  if (management.open) run(async () => showAccounts((await request(null, 'accounts')).accounts));
});
byId('gm-create').addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    const username = byId('gm-new-user').value.trim().toLowerCase();
    const result = await request(null, 'accounts', {
      action:'create', username, role:byId('gm-new-role').value, password:byId('gm-new-key').value,
    });
    showAccounts(result.accounts);
    event.target.reset();
    notify(`已创建 ${username}。`);
  });
});

let resetUser;
function openPassword(username) {
  resetUser = username;
  passwordForm.reset();
  byId('gm-password-feedback').textContent = '';
  byId('password-title').textContent = username ? `重设 ${username} 的密码` : '修改密码';
  byId('gm-current-password-row').hidden = Boolean(username);
  byId('gm-current-password').required = !username;
  passwordDialog.showModal();
}
byId('gm-password-open').addEventListener('click', () => openPassword());
byId('gm-password-cancel').addEventListener('click', () => passwordDialog.close());
passwordForm.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
    byId('gm-password-feedback').textContent = '';
    const password = byId('gm-new-password').value;
    try {
      if (resetUser) {
        const result = await request(null, 'accounts', {action:'reset_password', username:resetUser, password});
        showAccounts(result.accounts);
        notify(`已重设 ${resetUser} 的密码。`);
      } else {
        await request(null, 'password', {current_password:byId('gm-current-password').value, password});
        logout();
        notify('密码已修改，请用新密码登录。');
      }
      passwordForm.reset();
      passwordDialog.close();
    } catch (error) {
      if (error.code === 'unauthorized') throw error;
      byId('gm-password-feedback').textContent = error.code === 'invalid_credentials'
        ? '当前密码不正确。' : errors[error.code] ?? '暂时无法保存密码。';
    }
  });
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
  if (!target || busy || actor.role === 'viewer') return;
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

run(async () => {
  try {
    await showWorkspace(await request(null, 'session'));
  } catch (error) {
    if (error.code !== 'unauthorized') throw error;
  }
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
