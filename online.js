if (onlineMode) {
 const entry = $('account-entry');
 const lobby = $('account-lobby');
 const townStage = $('town-stage');
 const shopPanel = $('town-shop-panel');
 const inventoryPanel = $('town-inventory-panel');
 const openInventory = $('open-inventory');
 const shopItems = $('town-shop-items');
 const inventoryItems = $('town-inventory-items');
 const renameForm = $('town-rename-form');
 const renameName = $('town-rename-name');
 const socialPanel = $('town-social-panel');
 const socialForm = $('town-social-form');
 const socialInput = $('town-social-input');
 const socialList = $('town-social-list');
 const socialFeedback = $('town-social-feedback');
 const socialLeave = $('town-social-leave');
 const socialConfirm = $('town-social-confirm');
 const socialTitles = {rankings:'本服等级榜', guilds:'帮派', friends:'好友'};
 const itemDetails = {rename_card:{name:'改名卡', description:'使用后可修改当前区服的角色名。'}};
 const pendingItemRequests = new Map();
 const avatarPanel = $('town-avatar-panel');
 const avatarPicker = $('open-avatar-picker');
 const avatarOptions = $('town-avatar-options');
 const avatarFeedback = $('town-avatar-feedback');
 const avatarChoices = {blue:'蓝围巾', red:'红围巾', green:'薄荷帽', gold:'星星领结'};
 const battleView = $('town-battle-view');
 const townFeedback = $('town-feedback');
 const closeBattleResult = $('close-battle-result');
 const accountFeedback = $('account-feedback');
 const loginForm = $('online-login');
 const townHistory = $('town-battle-history');
 const damagePanel = $('town-damage-panel');
 const weaponPanel = $('town-weapon-panel');
 const weaponList = $('town-weapon-list');
 const weaponReference = $('weapon-reference');
 const historyPanel = $('town-history-panel');
 const openHistory = $('open-history');
 const characterDetailsPanel = $('town-character-details-panel');
 const openCharacterDetails = $('open-character-details');
 const skillPanel = $('town-skill-panel');
 const openSkillCollection = $('open-skill-collection');
 const squarePanels = [historyPanel, characterDetailsPanel, skillPanel, inventoryPanel, shopPanel, socialPanel,
  avatarPanel, damagePanel, weaponPanel];
 const squarePanelButtons = lobby.querySelectorAll('button[aria-pressed][aria-controls]');
 const opponentsList = $('town-opponents');
 const opponentsEmpty = $('town-opponents-empty');
 const refreshOpponentsButton = $('refresh-opponents');
 const zoneGroups = $('zone-groups');
 const zoneOptions = $('zone-options');
 const zoneEnter = $('zone-enter');
 const savedAccount = $('saved-account');
 const zonesPerGroup = 10;
 const historyTimeFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit',
  hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23',
 });
 let account;
 let session;
 let selectedZone;
 let registering = false;
 let busy = false;
 let pending;
 let lastReport;
 let returnToSquareTimer;
 let selectedWeaponId;
 let shopCatalog = [];
 let socialSection;
 let currentGuild;

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
  invalid_request: '请检查区服和角色 UID。',
  request_conflict: '请求编号已被使用，请重新选择对手。',
  invalid_character_name: '请使用 2–16 个汉字、字母、数字或下划线。',
  insufficient_coins: '金币不足。',
  missing_item: '背包里没有改名卡。',
  same_name: '请输入和当前角色名不同的名字。',
  friend_self: '不能添加自己为好友。',
  friend_request_missing: '这条好友申请已失效。',
  invalid_guild_name: '帮派名须为 2–16 个汉字、字母、数字或下划线。',
  already_in_guild: '每个角色只能加入一个帮派。',
  guild_name_taken: '这个帮派名已被使用。',
  guild_full: '该帮派人数已满。',
  not_in_guild: '你当前没有加入帮派。',
  guild_owner_required: '只有帮主可以解散帮派。',
  guild_owner_cannot_leave: '帮主可以在帮派面板解散帮派。',
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
  clearTimeout(returnToSquareTimer);
  battleView.hidden = true;
  if (!session) showSquarePanel(historyPanel);
  townStage.hidden = false;
  entry.hidden = Boolean(session);
  $('account-login').hidden = Boolean(account);
  const choosingZone = Boolean(account && !session);
  $('account-zones').hidden = !choosingZone;
  entry.classList.toggle('choosing-zone', choosingZone);
  lobby.hidden = !session;
 }

 function selectZone(zone) {
  selectedZone = zone;
  $('zone-selection').textContent = zone ? `已选 ${zone.name}` : '';
  zoneEnter.disabled = busy || !zone;
  for (const button of zoneOptions.querySelectorAll('button')) {
   button.setAttribute('aria-pressed', String(Number(button.dataset.zone) === zone?.id));
  }
 }

 function renderZoneGroup(group, zones) {
  for (const button of zoneGroups.querySelectorAll('button')) {
   button.setAttribute('aria-pressed', String(Number(button.dataset.group) === group));
  }
  $('zone-group-title').textContent = group ? `${group}–${group + zonesPerGroup - 1} 服` : '区服列表';
  $('zone-count').textContent = zones.length ? `${zones.length} 个区服` : '';
  $('zone-empty').hidden = Boolean(zones.length);
  zoneOptions.replaceChildren(...zones.map(zone => {
   const row = document.createElement('li');
   const button = document.createElement('button');
   const name = document.createElement('span');
   const indicator = document.createElement('span');
   button.type = 'button';
   button.className = 'zone-row';
   button.dataset.zone = zone.id;
   button.disabled = busy;
   name.textContent = zone.name;
   indicator.className = 'zone-indicator';
   indicator.setAttribute('aria-hidden', 'true');
   button.append(name, indicator);
   button.addEventListener('click', () => selectZone(zone));
   row.append(button);
   return row;
  }));
  selectZone(zones.find(zone => zone.id === selectedZone?.id) ?? zones[0]);
 }

 async function showZones() {
  const {zones} = await api(null, '/zones');
  session = pending = lastReport = null;
  townHistory.replaceChildren();
  opponentsList.replaceChildren();
  $('zone-account-name').textContent = account.username;
  const groups = new Map();
  for (const zone of [...zones].sort((a, b) => a.id - b.id)) {
   const group = Math.floor((zone.id - 1) / zonesPerGroup) * zonesPerGroup + 1;
   if (!groups.has(group)) groups.set(group, []);
   groups.get(group).push(zone);
  }
  zoneGroups.replaceChildren(...[...groups].map(([group, members]) => {
   const button = document.createElement('button');
   button.type = 'button';
   button.className = 'zone-group-button';
   button.dataset.group = group;
   button.disabled = busy;
   button.textContent = `${group}–${group + zonesPerGroup - 1} 服`;
   button.addEventListener('click', () => renderZoneGroup(group, members));
   return button;
  }));
  const previousGroup = [...groups].find(([, members]) => members.some(zone => zone.id === selectedZone?.id));
  const [group, members] = previousGroup ?? groups.entries().next().value ?? [null, []];
  renderZoneGroup(group, members);
  showEntry();
  $('zone-title').focus();
 }

 zoneEnter.addEventListener('click', () => run(async () => {
  if (!selectedZone) return;
  acceptSession(await api(selectedZone.id, '/enter', {}));
  townStage.focus();
  await Promise.all([refreshOpponents(), refreshHistory()]);
 }));

 function acceptSession(data) {
  pendingItemRequests.clear();
  showSquarePanel(historyPanel);
  renderPlayer(data);
  townFeedback.textContent = '';
  $('town-history-empty').hidden = true;
  opponentsEmpty.hidden = true;
  opponentsList.replaceChildren();
  showEntry();
 }

 function renderPlayer(data) {
  session = data;
  const {player, zone, progression} = data;
  $('town-zone').textContent = `${zone} 服`;
  $('town-player-name').textContent = player.name;
  $('town-player-avatar').src = avatarUrl(player.avatar_id);
  $('town-detail-name').textContent = player.name;
  $('town-detail-uid').textContent = player.player_id;
  $('town-hp').textContent = player.max_hp;
  $('town-attack').textContent = player.attack;
  $('town-defense').textContent = player.defense;
  $('town-hp-breakdown').textContent = `生命上限 ${player.max_hp} · 基础生命 ${player.max_hp}`;
  $('town-attack-breakdown').textContent = `总攻击 ${player.attack} · 基础攻击 ${player.attack}`;
  $('town-defense-breakdown').textContent = `总防御 ${player.defense} · 基础防御 ${player.defense}`;
  const hasCombo = player.skill_id === 'combo';
  $('town-combo-skill').hidden = !hasCombo;
  $('town-skill-empty').hidden = hasCombo;
  $('town-level').textContent = `Lv. ${progression.level}`;
  $('town-xp').max = progression.next_level_xp;
  $('town-xp').value = progression.xp;
  $('town-xp-text').textContent = `${progression.xp} / ${progression.next_level_xp} 经验`;
  $('town-xp-remaining').textContent = `距升级还差 ${progression.next_level_xp - progression.xp} 经验`;
  if (!weaponPanel.hidden) renderWeaponCollection();
  $('town-coins').textContent = `${data.inventory.coins} 金币`;
  if (!shopPanel.hidden) renderShop();
  if (!inventoryPanel.hidden) renderInventory();
 }

 function showSquarePanel(panel, button = null, moveFocus = false) {
  for (const section of squarePanels) section.hidden = section !== panel;
  if (panel === historyPanel) button = openHistory;
  for (const trigger of squarePanelButtons) trigger.setAttribute('aria-pressed', String(trigger === button));
  if (moveFocus) {
   const heading = panel.querySelector('h2');
   heading.focus({preventScroll:true});
   heading.scrollIntoView({block:'nearest'});
  }
 }

 openHistory.addEventListener('click', () => showSquarePanel(historyPanel, openHistory, true));
 openCharacterDetails.addEventListener('click', () => showSquarePanel(characterDetailsPanel, openCharacterDetails, true));

 function itemRow(name, description, action, onClick, disabled = false) {
  const row = document.createElement('li');
  const info = document.createElement('div');
  const label = document.createElement('strong');
  const detail = document.createElement('p');
  const button = document.createElement('button');
  label.textContent = name;
  detail.textContent = description;
  button.type = 'button';
  button.className = 'town-item-action';
  button.textContent = action;
  if (disabled) button.dataset.unavailable = '';
  button.disabled = disabled || busy;
  button.addEventListener('click', onClick);
  info.append(label, detail);
  row.append(info, button);
  return row;
 }

 function renderShop() {
  const {coins} = session.inventory;
  $('town-shop-coins').textContent = `金币余额 ${coins}`;
  shopItems.replaceChildren(...shopCatalog.map(item => {
   const affordable = coins >= item.price;
   const description = itemDetails[item.id]?.description;
   return itemRow(item.name, description ? `${description} ${item.price} 金币` : `${item.price} 金币`,
    affordable ? '购买' : '金币不足', () => itemAction(shopPanel, $('town-shop-feedback'), '/shop/buy',
     {item_id:item.id}, `已购买「${item.name}」，可在背包查看。`), !affordable);
  }));
 }

 function renderInventory() {
  const {items} = session.inventory;
  $('town-inventory-empty').hidden = items.length > 0;
  inventoryItems.replaceChildren(...items.map(item => {
   const definition = itemDetails[item.item_id];
   if (item.item_id !== 'rename_card') return itemRow(definition?.name ?? item.item_id,
    `数量 ${item.quantity}`, '暂不可使用', () => {}, true);
   return itemRow(definition.name, `数量 ${item.quantity} · ${definition.description}`, '使用', () => {
    $('town-inventory-feedback').textContent = '';
    renameForm.hidden = false;
    renameName.focus();
   });
  }));
 }

 function newRequestId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
 }

 function itemAction(container, feedback, path, body, success) {
  return run(async () => {
   feedback.textContent = '';
   delete feedback.dataset.error;
   const key = JSON.stringify([session.zone, path, body]);
   const requestId = pendingItemRequests.get(key) ?? newRequestId();
   pendingItemRequests.set(key, requestId);
   try {
    const data = await api(session.zone, path, {...body, request_id:requestId});
    pendingItemRequests.delete(key);
    if (path === '/items/use') {
     renameForm.reset();
     renameForm.hidden = true;
    }
    renderPlayer(data);
    feedback.textContent = success;
    if (!container.hidden) container.querySelector('h2').focus({preventScroll:true});
   } catch (error) {
    if (error.code === 'unauthorized') throw error;
    if (error.code && error.code !== 'unavailable') pendingItemRequests.delete(key);
    feedback.dataset.error = '';
    feedback.textContent = error.code ? error.message : messages.unavailable;
   }
  });
 }

 function openShop() {
  return run(async () => {
   shopCatalog = (await api(session.zone, '/shop')).items;
   $('town-shop-feedback').textContent = '';
   renderShop();
   showSquarePanel(shopPanel, $('open-shop'), true);
  });
 }

 $('open-shop').addEventListener('click', openShop);
 $('inventory-open-shop').addEventListener('click', openShop);
 openInventory.addEventListener('click', () => {
  $('town-inventory-feedback').textContent = '';
  renameForm.reset();
  renameForm.hidden = true;
  renderInventory();
  showSquarePanel(inventoryPanel, openInventory, true);
 });
 renameForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = renameName.value.trim();
  itemAction(inventoryPanel, $('town-inventory-feedback'), '/items/use',
   {item_id:'rename_card', name}, `角色名已改为「${name}」。`);
 });

 function addSocialButton(row, name, action, data, success, disabled = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'town-item-action';
  button.textContent = name;
  if (disabled) button.dataset.unavailable = '';
  button.disabled = busy || disabled;
  button.addEventListener('click', () => socialAction(action, data, success));
  row.append(button);
 }

 function socialPlayerRow(player, detail, title = player.name) {
  const row = document.createElement('li');
  const portrait = document.createElement('img');
  const info = document.createElement('div');
  const name = document.createElement('strong');
  const description = document.createElement('p');
  portrait.src = avatarUrl(player.avatar_id);
  portrait.alt = '';
  portrait.className = 'town-opponent-avatar';
  name.textContent = title;
  description.textContent = detail;
  if (player.player_id === session.player.player_id) row.dataset.self = '';
  info.append(name, description);
  row.append(portrait, info);
  return row;
 }

 function renderSocial(data) {
  const guildView = socialSection === 'guilds';
  const friendView = socialSection === 'friends';
  currentGuild = guildView ? data.current : null;
  socialForm.hidden = !friendView && (!guildView || Boolean(currentGuild));
  $('town-social-summary').hidden = !currentGuild;
  socialConfirm.hidden = true;
  if (!socialForm.hidden) {
   $('town-social-label').textContent = friendView ? '本服玩家 UID' : '帮派名称';
   $('town-social-submit').textContent = friendView ? '发送申请' : '创建帮派';
   socialInput.maxLength = friendView ? 20 : 16;
   socialInput.inputMode = friendView ? 'numeric' : 'text';
  }
  let rows;
  let empty;
  if (guildView && currentGuild) {
   const owner = currentGuild.owner_id === session.player.player_id;
   $('town-social-group').textContent = `${currentGuild.name} · ${currentGuild.members.length}/${data.capacity} 人`;
   socialLeave.textContent = owner ? '解散帮派' : '退出帮派';
   rows = currentGuild.members.map(player => socialPlayerRow(player,
    `${player.player_id === currentGuild.owner_id ? '帮主' : '成员'} · UID ${player.player_id}`));
  } else if (guildView) {
   empty = '本服暂时没有帮派。';
   rows = data.guilds.map(guild => {
    const row = document.createElement('li');
    const info = document.createElement('div');
    const name = document.createElement('strong');
    const members = document.createElement('p');
    name.textContent = guild.name;
    members.textContent = `${guild.member_count}/${data.capacity} 人`;
    info.append(name, members);
    row.append(info);
    addSocialButton(row, '加入', 'join', {guild_id:guild.guild_id}, `已加入「${guild.name}」。`,
     guild.member_count >= data.capacity);
    return row;
   });
  } else if (friendView) {
   empty = '暂无好友或申请。';
   rows = data.players.map(player => {
    const status = {friend:'好友', incoming:'收到申请', outgoing:'等待同意'}[player.status];
    const row = socialPlayerRow(player, `${status} · UID ${player.player_id}`);
    const target = {player_id:player.player_id};
    if (player.status === 'incoming') addSocialButton(row, '同意', 'accept', target, '已添加好友。');
    const remove = {friend:'移除好友', incoming:'拒绝', outgoing:'撤回'}[player.status];
    addSocialButton(row, remove, 'remove', target, '已处理。');
    return row;
   });
  } else {
   empty = '本服暂无排名。';
   rows = data.players.map(player => socialPlayerRow(player,
    `Lv. ${player.level} · ${player.xp}/100 经验`, `${player.rank}. ${player.name}`));
  }
  socialList.replaceChildren(...rows);
  $('town-social-empty').hidden = rows.length > 0;
  $('town-social-empty').textContent = empty ?? '';
 }

 function socialAction(action, data, success) {
  return run(async () => {
   socialFeedback.textContent = '';
   delete socialFeedback.dataset.error;
   try {
    renderSocial(await api(session.zone, `/${socialSection}`, {action, ...data}));
    socialForm.reset();
    socialFeedback.textContent = success;
    if (!socialPanel.hidden) $('town-social-title').focus({preventScroll:true});
   } catch (error) {
    if (error.code === 'unauthorized') throw error;
    socialFeedback.dataset.error = '';
    socialFeedback.textContent = error.code ? error.message : messages.unavailable;
   }
  });
 }

 for (const [section, title] of Object.entries(socialTitles)) {
  $(`open-${section}`).addEventListener('click', () => run(async () => {
   const data = await api(session.zone, `/${section}`);
   socialSection = section;
   $('town-social-title').textContent = title;
   socialFeedback.textContent = '';
   socialForm.reset();
   renderSocial(data);
   showSquarePanel(socialPanel, $(`open-${section}`), true);
  }));
 }
 socialForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = socialInput.value.trim();
  if (socialSection === 'friends') socialAction('request', {player_id:value}, '好友申请已处理，可在列表查看状态。');
  else socialAction('create', {name:value}, `已创建「${value}」。`);
 });
 socialLeave.addEventListener('click', () => {
  if (currentGuild.owner_id !== session.player.player_id) {
   socialAction('leave', {}, '已退出帮派。');
  } else if (socialConfirm.hidden) {
   socialConfirm.hidden = false;
   socialLeave.textContent = '确认解散';
  } else {
   socialAction('disband', {}, '已解散帮派。');
  }
 });

 function avatarUrl(id) {
  return `assets/avatar-${Object.hasOwn(avatarChoices, id) ? id : 'blue'}.jpg`;
 }

 function updateAvatarSelection() {
  const current = session.player.avatar_id ?? 'blue';
  for (const button of avatarOptions.querySelectorAll('button')) {
   const selected = button.dataset.avatar === current;
   button.setAttribute('aria-pressed', String(selected));
   button.querySelector('small').hidden = !selected;
  }
 }

 for (const [id, label] of Object.entries(avatarChoices)) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  const portrait = document.createElement('img');
  const name = document.createElement('span');
  const selected = document.createElement('small');
  button.type = 'button';
  button.dataset.avatar = id;
  button.setAttribute('aria-label', label);
  portrait.src = avatarUrl(id);
  portrait.alt = '';
  name.textContent = label;
  selected.textContent = '使用中';
  selected.hidden = true;
  button.append(portrait, name, selected);
  button.addEventListener('click', () => {
   if (id === session.player.avatar_id) return;
   run(async () => {
    avatarFeedback.textContent = '';
    try {
     const {avatar_id} = await api(session.zone, '/avatar', {avatar_id:id});
     session.player.avatar_id = avatar_id;
     $('town-player-avatar').src = avatarUrl(avatar_id);
     updateAvatarSelection();
     avatarFeedback.textContent = `已更换为「${label}」`;
    } catch (error) {
     if (error.code === 'unauthorized') throw error;
     avatarFeedback.textContent = error.code ? error.message : messages.unavailable;
    }
   });
  });
  item.append(button);
  avatarOptions.append(item);
 }
 avatarPicker.addEventListener('click', () => {
  avatarFeedback.textContent = '';
  updateAvatarSelection();
  showSquarePanel(avatarPanel, avatarPicker, true);
 });

 function weaponMoveLabel(move) {
  return `${move.name} · ${move.range === 'ranged' ? '远程' : '近战'}`;
 }

 function selectWeapon(id) {
  selectedWeaponId = id;
  const currentId = weaponReference.value;
  const current = weaponMoves[currentId];
  const selected = weaponMoves[id];
  const owned = session.progression.weapons.includes(id);
  $('weapon-current-move').textContent = current ? weaponMoveLabel(current) : '';
  $('weapon-current-damage').textContent = current?.damage ?? '—';
  $('weapon-selected-name').textContent = selected?.label ?? '请选择武器';
  $('weapon-selected-move').textContent = selected ? weaponMoveLabel(selected) : '';
  $('weapon-selected-damage').textContent = selected?.damage ?? '—';
  const change = $('weapon-damage-change');
  change.hidden = !current || !selected || id === currentId;
  if (!change.hidden) {
   const delta = selected.damage - current.damage;
   change.textContent = delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : '相同';
   change.dataset.direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
  }
  $('weapon-selection-status').textContent = owned ? '已加入战斗抽取池' : '未获得';
  for (const button of weaponList.querySelectorAll('button')) {
   button.setAttribute('aria-pressed', String(button.dataset.weapon === id));
  }
 }

 function renderWeaponCollection() {
  const owned = new Set(session.progression.weapons);
  const previousReference = weaponReference.value;
  weaponReference.replaceChildren(...[...owned].map(id => new Option(weaponMoves[id].label, id)));
  if (owned.has(previousReference)) weaponReference.value = previousReference;
  const catalog = Object.entries(weaponMoves).sort(([a], [b]) => Number(owned.has(b)) - Number(owned.has(a)));
  $('town-weapon-count').textContent = `已收集 ${owned.size} / ${catalog.length}`;
  weaponList.replaceChildren(...catalog.map(([id, move]) => {
   const item = document.createElement('li');
   const button = document.createElement('button');
   button.type = 'button';
   button.dataset.weapon = id;
   button.disabled = busy;
   const icon = document.createElement('span');
   icon.className = 'town-item-icon';
   icon.textContent = move.icon || '⚔';
   icon.setAttribute('aria-hidden', 'true');
   const info = document.createElement('span');
   const label = document.createElement('strong');
   label.textContent = move.label;
   const detail = document.createElement('small');
   detail.textContent = weaponMoveLabel(move);
   info.append(label, detail);
   const state = document.createElement('span');
   state.className = owned.has(id) ? 'weapon-owned' : 'weapon-state';
   state.textContent = owned.has(id) ? '已拥有' : '未获得';
   button.append(icon, info, state);
   button.addEventListener('click', () => selectWeapon(id));
   item.append(button);
   return item;
  }));
  selectWeapon(selectedWeaponId);
 }
 weaponReference.addEventListener('change', () => selectWeapon(selectedWeaponId));
 $('open-weapon-collection').addEventListener('click', () => {
  const reference = session.progression.weapons.includes(weaponReference.value)
   ? weaponReference.value : session.progression.weapons[0];
  selectedWeaponId = session.progression.weapons.find(id => id !== reference)
   ?? Object.keys(weaponMoves).find(id => id !== reference);
  renderWeaponCollection();
  showSquarePanel(weaponPanel, $('open-weapon-collection'), true);
 });
 openSkillCollection.addEventListener('click', () => {
  showSquarePanel(skillPanel, openSkillCollection, true);
 });
 function lock(value) {
  busy = value;
  $('login-submit').disabled = value;
  refreshOpponentsButton.disabled = value;
  $('online-logout').disabled = value;
  $('zone-logout').disabled = value;
  $('switch-zone').disabled = value;
  $('toggle-register').disabled = value;
  savedAccount.disabled = value;
  $('saved-login').disabled = value;
  $('saved-forget').disabled = value;
  $('open-weapon-collection').disabled = value;
  openHistory.disabled = value;
  openCharacterDetails.disabled = value;
  openSkillCollection.disabled = value;
  avatarPicker.disabled = value;
  for (const id of ['open-shop', 'open-inventory', 'inventory-open-shop', 'town-rename-submit']) $(id).disabled = value;
  for (const id of ['open-rankings', 'open-guilds', 'open-friends', 'town-social-submit']) $(id).disabled = value;
  socialInput.disabled = value;
  socialLeave.disabled = value;
  renameName.disabled = value;
  for (const list of [shopItems, inventoryItems, socialList]) {
   for (const button of list.querySelectorAll('button')) button.disabled = value || button.hasAttribute('data-unavailable');
  }
  for (const button of avatarOptions.querySelectorAll('button')) button.disabled = value;
  for (const button of weaponList.querySelectorAll('button')) button.disabled = value;
  for (const button of townHistory.querySelectorAll('button')) button.disabled = value;
  for (const button of opponentsList.querySelectorAll('button')) button.disabled = value;
  for (const button of zoneOptions.querySelectorAll('button')) button.disabled = value;
  for (const button of zoneGroups.querySelectorAll('button')) button.disabled = value;
  zoneEnter.disabled = value || !selectedZone;
 }

 function damageBySource(events) {
  const totals = new Map();
  for (const event of events) {
   if (event.kind !== 'hit') continue;
   const key = `${event.actor}:${event.source_type}:${event.source_id}`;
   const total = totals.get(key) ?? {actor:event.actor, name:event.source_name, damage:0};
   total.damage += event.applied_damage;
   totals.set(key, total);
  }
  return [...totals.values()];
 }

 function battleTurns(report) {
  const turns = [];
  for (const event of report.events) {
   const number = report.rules_version === 1 ? Math.ceil(event.round / 2) : event.round;
   let turn = turns.at(-1);
   if (turn?.number !== number || turn.attacker !== event.actor) {
    turn = {
     number, attacker:event.actor, defender:event.target,
     move:weaponMoves[event.move_id] ?? punch, dodge:event.kind === 'dodge',
     damage:0, remainingHp:event.remaining_hp, events:[], drawsFromPool:report.rules_version >= 4,
    };
    turns.push(turn);
   }
   turn.events.push(event);
   turn.damage += event.applied_damage;
   turn.remainingHp = event.remaining_hp;
  }
  return turns;
 }

 async function playback(report, rewardText) {
  clearTimeout(returnToSquareTimer);
  showSquarePanel(historyPanel);
  townStage.hidden = true;
  battleView.hidden = false;
  $('arena-title').focus({preventScroll:true});
  battleView.scrollIntoView({block:'nearest'});
  lastReport = report;
  await playBattle({
   turns:battleTurns(report), hp:{left:report.left_hp, right:report.right_hp}, winner:report.winner,
   players:{left:report.attacker, right:report.defender}, damageTotals:damageBySource(report.events), rewardText,
  });
  returnToSquareTimer = setTimeout(returnToSquare, 3000);
 }

 function showDamageReport(report, time) {
  const names = {left:report.attacker.name, right:report.defender.name};
  if (names.left === names.right) {
   names.left += '（先手）';
   names.right += '（后手）';
  }
  const outcome = report.winner === 'draw' ? '平局' : `${names[report.winner]}获胜`;
  $('town-damage-match').textContent = `${names.left} 对战 ${names.right} · ${outcome} · ${time}`;

  const totals = damageBySource(report.events);
  const summary = $('town-damage-summary');
  summary.replaceChildren();
  for (const [side, name] of Object.entries(names)) {
   const sources = totals.filter(total => total.actor === side);
   const card = document.createElement('section');
   const title = document.createElement('h4');
   title.textContent = `${name} · 实际伤害 ${sources.reduce((sum, source) => sum + source.damage, 0)}`;
   const list = document.createElement('ul');
   for (const source of sources) {
    const item = document.createElement('li');
    item.textContent = `${source.name} · ${source.damage} 点`;
    list.append(item);
   }
   card.append(title, list);
   summary.append(card);
  }

  const rounds = $('town-damage-rounds');
  rounds.replaceChildren();
  let roundNumber;
  let roundActions;
  const turns = battleTurns(report);
  for (const turn of turns) {
   if (roundNumber !== turn.number) {
    roundNumber = turn.number;
    const round = document.createElement('li');
    const title = document.createElement('h4');
    title.textContent = `第 ${roundNumber} 回合`;
    roundActions = document.createElement('div');
    round.append(title, roundActions);
    rounds.append(round);
   }
   const title = document.createElement('h5');
   title.textContent = `${names[turn.attacker]}出手`;
   const events = document.createElement('ul');
   for (const event of turn.events) {
    const item = document.createElement('li');
    const defender = names[event.target];
    const move = `${event.source_name} · ${event.move_name}`;
    if (event.kind === 'dodge') {
     item.textContent = `使用「${move}」，被 ${defender} 闪避。`;
    } else if (event.kind === 'knockout') {
     item.textContent = `${defender} 倒下了。`;
    } else {
     const calculated = event.damage !== event.applied_damage ? `（计算伤害 ${event.damage}）` : '';
     const critical = event.critical ? '（暴击）' : '';
     const action = event.source_id === 'combo' ? '追加连击' : '出招';
     item.textContent = `${action}「${move}」${critical}，${defender} 扣血 ${event.applied_damage}${calculated}，剩余生命 ${event.remaining_hp}。`;
    }
    events.append(item);
   }
   roundActions.append(title, events);
  }
  const lastTurn = turns.at(-1);
  if (lastTurn?.attacker === 'left') {
   const note = document.createElement('p');
   note.textContent = `${names[lastTurn.defender]}未出手，本回合未打完。`;
   roundActions.append(note);
  }

  showSquarePanel(damagePanel, null, true);
 }

 async function refreshHistory() {
  const {battles} = await api(session.zone, '/battles');
  townHistory.replaceChildren();
  $('town-history-empty').hidden = Boolean(battles.length);
  for (const report of battles) {
   const item = document.createElement('li');
   const playButton = document.createElement('button');
   const reportButton = document.createElement('button');
   const actions = document.createElement('div');
   const info = document.createElement('div');
   const details = document.createElement('span');
   const name = document.createElement('span');
   const time = document.createElement('time');
   const result = document.createElement('span');
   info.className = 'town-history-info';
   actions.className = 'town-history-actions';
   details.className = 'town-history-details';
   name.textContent = report.opponent;
   const playedAt = new Date(Number(report.created_at_epoch) * 1000);
   if (Number.isFinite(playedAt.getTime())) {
    time.dateTime = playedAt.toISOString();
    time.textContent = historyTimeFormat.format(playedAt);
   } else {
    time.textContent = report.created_at.slice(0, 19);
   }
   details.append(name, time);
   result.className = `town-outcome town-outcome-${report.winner}`;
   result.textContent = {left:'胜', right:'负', draw:'平'}[report.winner];
   info.append(details, result);
   const matchLabel = `${report.opponent}，${time.textContent}`;
   const path = `/battles/${report.battle_id}`;
   playButton.type = 'button';
   playButton.disabled = busy;
   playButton.textContent = '播放';
   playButton.setAttribute('aria-label', `播放，${matchLabel}`);
   playButton.addEventListener('click', () => run(async () => playback(await api(session.zone, path))));
   reportButton.type = 'button';
   reportButton.disabled = busy;
   reportButton.textContent = '文字战报';
   reportButton.setAttribute('aria-label', `文字战报，${matchLabel}`);
   reportButton.addEventListener('click', () => run(async () => {
    const battle = await api(session.zone, path);
    showDamageReport(battle, time.textContent);
   }));
   actions.append(reportButton, playButton);
   item.append(info, actions);
   townHistory.append(item);
  }
 }

 async function refreshOpponents() {
  const {opponents} = await api(session.zone, '/opponents');
  opponentsList.replaceChildren(...opponents.map(player => {
   const row = document.createElement('li');
   const avatar = document.createElement('img');
   const details = document.createElement('span');
   const name = document.createElement('strong');
   const uid = document.createElement('small');
   const button = document.createElement('button');
   avatar.className = 'town-opponent-avatar';
   avatar.src = avatarUrl(player.avatar_id);
   avatar.alt = '';
   details.className = 'town-opponent-details';
   name.textContent = player.name;
   uid.textContent = `UID ${player.player_id}`;
   details.append(name, uid);
   button.type = 'button';
   button.disabled = busy;
   button.textContent = '挑战';
   button.setAttribute('aria-label', `挑战 ${player.name}，UID ${player.player_id}`);
   button.addEventListener('click', () => run(() => challenge(player.player_id)));
   row.append(avatar, details, button);
   return row;
  }));
  opponentsEmpty.hidden = opponents.length > 0;
 }

 async function run(action) {
  if (busy) return;
  lock(true);
  const status = lobby.hidden ? accountFeedback : townFeedback;
  status.textContent = '';
  try {
   await action();
  } catch (error) {
   if (error.code === 'unauthorized') {
    account = session = pending = lastReport = null;
    selectedZone = null;
    setRegistration(false);
    showEntry();
    accountFeedback.textContent = messages.unauthorized;
    await refreshSavedAccounts().catch(() => {});
   } else {
    const activeStatus = lobby.hidden ? accountFeedback : townFeedback;
    activeStatus.textContent = error instanceof SyntaxError || error instanceof TypeError ? messages.unavailable : error.message;
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

 function returnToSquare() {
  showEntry();
  townStage.focus();
 }

 closeBattleResult.addEventListener('click', returnToSquare);

 async function challenge(playerId) {
  prepareSound();
  playMusic();
  if (pending?.target_player_id !== playerId) {
   const requestId = newRequestId();
   pending = {target_zone:session.zone, target_player_id:playerId, request_id:requestId};
  }
  const report = await api(session.zone, '/battles', pending);
  pending = null;
  const reward = report.reward;
  const weapon = weaponMoves[reward?.weapon_id];
  let rewardText = reward ? `+${reward.xp} 经验` : '';
  if (reward?.level_up) rewardText += ` · 升至 Lv. ${reward.level} · ${weapon ? '获得' + weapon.label : '武器已集齐'}`;
  await playback(report, rewardText);
  await Promise.all([
   refreshHistory(),
   api(session.zone, '/session').then(renderPlayer),
  ]);
 }

 refreshOpponentsButton.addEventListener('click', () => run(refreshOpponents));

 $('switch-zone').addEventListener('click', () => run(showZones));
 function logout() {
  return run(async () => {
   await api(null, '/logout', {});
   account = session = pending = lastReport = null;
   selectedZone = null;
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
 battleView.append($('battle-game'), $('battle-log'));
 const battleNames = [$('name-left'), $('name-right')];
 const nameSizeObserver = new ResizeObserver(() => {
  for (const name of battleNames) {
   const width = name.offsetWidth;
   const available = name.parentElement.clientWidth;
   name.style.scale = width > available && available > 0 ? `${available / width} 1` : '';
  }
 });
 for (const name of battleNames) {
  nameSizeObserver.observe(name);
  nameSizeObserver.observe(name.parentElement);
 }
 $('arena-title').textContent = '乐斗';
 $('demo-label').hidden = true;
 closeBattleResult.hidden = false;
 again.textContent = '回放本场 ↗';
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
