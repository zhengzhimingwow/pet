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
 const socialTitles = {rankings:'等级榜', guilds:'帮派', friends:'好友'};
 const itemDetails = {rename_card:{name:'改名卡', description:'使用后可修改角色名。'}};
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
 const weaponTip = $('town-weapon-tip');
 const historyPanel = $('town-history-panel');
 const openHistory = $('open-history');
 const playerLogPanel = $('town-player-log-panel');
 const openPlayerLog = $('open-player-log');
 const playerLogList = $('town-player-log');
 const playerLogMore = $('town-player-log-more');
 const mailPanel = $('town-mail-panel');
 const openMail = $('open-mail');
 const mailList = $('town-mail-list');
 const mailCount = $('town-mail-count');
 const mailReadAll = $('town-mail-read-all');
 const mailRefresh = $('town-mail-refresh');
 const mailMore = $('town-mail-more');
 const characterDetailsPanel = $('town-character-details-panel');
 const openCharacterDetails = $('open-character-details');
 const skillPanel = $('town-skill-panel');
 const openSkillCollection = $('open-skill-collection');
 const opponentPanel = $('town-opponent-panel');
 const closeOpponentProfile = $('close-opponent-profile');
 const challengeOpponentProfile = $('challenge-opponent-profile');
 const squarePanels = [historyPanel, playerLogPanel, characterDetailsPanel, skillPanel, inventoryPanel, shopPanel, socialPanel,
  avatarPanel, damagePanel, weaponPanel, opponentPanel, mailPanel];
 const squarePanelButtons = lobby.querySelectorAll('button[aria-pressed][aria-controls]');
 const opponentsList = $('town-opponents');
 const opponentsEmpty = $('town-opponents-empty');
 const refreshOpponentsButton = $('refresh-opponents');
 const savedAccount = $('saved-account');
 const historyTimeFormat = new Intl.DateTimeFormat('zh-CN', {
  timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit',
  hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23',
 });
 let session;
 let registering = false;
 let busy = false;
 let pending;
 let lastReport;
 let returnToSquareTimer;
 let shopCatalog = [];
 let socialSection;
 let currentGuild;
 let viewedOpponent;
 let opponentReturn;
 let recentOpponentIds = [];
 let nextMail;
 let unreadMail = 0;
 let nextPlayerLog;
 let weaponTipTrigger;
 let dailyTask;
 let dailyResetTimer;
 const dailyTasks = $('town-tasks');
 const dailyToggle = $('town-daily-toggle');
 const dailyDetails = $('town-daily');
 const dailyClaim = $('town-daily-claim');
 const opponentFriendStates = new Map();

 const messages = {
  unauthorized: '登录已失效，请重新登录。',
  invalid_credentials: '账号或密码有误，请检查后重试。',
  invalid_registration: '请使用 3–32 位字母、数字或下划线作为账号。',
  account_taken: '这个账号已被注册，可以直接登录或换一个账号。',
  remember_expired: '这个账号的免密登录已过期，请输入密码重新登录。',
  player_not_entered: '请重新进入游戏。',
  rate_limited: '登录尝试较多，请稍后重试。',
  not_found: '没有找到该角色或战报。',
  same_player: '请选择其他玩家。',
  invalid_request: '请检查角色 UID。',
  request_conflict: '请求编号已被使用，请重新选择对手。',
  task_incomplete: '今日乐斗次数还不够。',
  task_claimed: '今日经验已领取。',
  task_reset: '每日任务已刷新。',
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
  unavailable: '游戏或战斗服务暂时不可用，请稍后重试。',
 };

 async function api(service, path, body) {
  const prefix = `api/${service}`;
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
  if (!session) clearTimeout(dailyResetTimer);
  battleView.hidden = true;
  if (!session) showSquarePanel(historyPanel);
  townStage.hidden = false;
  entry.hidden = Boolean(session);
  lobby.hidden = !session;
 }

 async function enterGame() {
  acceptSession(await api('game', '/enter', {}));
  townStage.focus();
  await Promise.all([refreshOpponents(), refreshHistory(), refreshMailCount()]);
 }

 function acceptSession(data) {
  pendingItemRequests.clear();
  opponentFriendStates.clear();
  recentOpponentIds = [];
  showDailyDetails(false);
  $('town-daily-result').hidden = true;
  mailList.replaceChildren();
  nextMail = null;
  mailMore.hidden = true;
  setMailCount(0);
  renameForm.reset();
  renameForm.hidden = true;
  $('town-rename-feedback').textContent = '';
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
  const {player, progression} = data;
  renderDailyTask(data.daily_task);
  $('town-player-name').textContent = player.name;
  updatePlayerAvatar(player.avatar_id);
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

 function updateDailyClaim() {
  dailyClaim.disabled = busy || !dailyTask || dailyTask.claimed || dailyTask.progress < dailyTask.target;
  dailyClaim.toggleAttribute('data-unavailable', !dailyTask || dailyTask.claimed || dailyTask.progress < dailyTask.target);
 }

 function showDailyDetails(open) {
  dailyDetails.hidden = !open;
  dailyToggle.setAttribute('aria-expanded', String(open));
 }

 dailyToggle.addEventListener('click', () => showDailyDetails(dailyDetails.hidden));
 dailyTasks.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || dailyDetails.hidden) return;
  showDailyDetails(false);
  dailyToggle.focus();
 });

 function renderDailyTask(task) {
  clearTimeout(dailyResetTimer);
  dailyTask = task;
  dailyTasks.hidden = !task;
  updateDailyClaim();
  if (!task) {
   showDailyDetails(false);
   return;
  }
  $('town-daily-rule').textContent = `完成与 ${task.target} 位不同对手的挑战或回敬，AI 陪练也计入。`;
  $('town-daily-progress').textContent = `${task.progress} / ${task.target} · 每日重置`;
  dailyClaim.textContent = task.claimed ? '已领取' : `领 ${task.reward_xp} 经验`;
  dailyResetTimer = setTimeout(function refreshAtMidnight() {
   if (!session) return;
   if (busy) {
    dailyResetTimer = setTimeout(refreshAtMidnight, 1000);
    return;
   }
   run(async () => {
    $('town-daily-result').hidden = true;
    renderDailyTask(await api('game', '/daily-task'));
   });
  }, Math.max(1000, task.resets_at * 1000 - Date.now() + 500));
 }

 dailyClaim.addEventListener('click', () => run(async () => {
  try {
   const data = await api('game', '/daily-task/claim', {day:dailyTask.day});
   renderPlayer(data);
   const result = $('town-daily-result');
   result.textContent = `已领取 ${data.reward.xp} 经验`;
   result.hidden = false;
   if (!playerLogPanel.hidden) await refreshPlayerLog();
  } catch (error) {
   if (['task_reset', 'task_claimed', 'task_incomplete'].includes(error.code)) {
    renderDailyTask(await api('game', '/daily-task'));
   }
   throw error;
  }
 }));

 function showSquarePanel(panel, button = null, moveFocus = false) {
  if (panel !== opponentPanel) {
   viewedOpponent = opponentReturn = null;
  }
  for (const section of squarePanels) section.hidden = section !== panel;
  if (panel !== weaponPanel) closeWeaponTip();
  if (panel === historyPanel) button = openHistory;
  for (const trigger of squarePanelButtons) trigger.setAttribute('aria-pressed', String(trigger === button));
  if (moveFocus) {
   const heading = panel.querySelector('h2');
   heading.focus({preventScroll:true});
   heading.scrollIntoView({block:'nearest'});
  }
 }

 openHistory.addEventListener('click', () => run(async () => {
  showSquarePanel(historyPanel, openHistory, true);
  await refreshHistory();
 }));
 openPlayerLog.addEventListener('click', () => run(async () => {
  await refreshPlayerLog();
  showSquarePanel(playerLogPanel, openPlayerLog, true);
 }));
 playerLogMore.addEventListener('click', () => run(() => refreshPlayerLog(nextPlayerLog)));
 openCharacterDetails.addEventListener('click', () => showSquarePanel(characterDetailsPanel, openCharacterDetails, true));
 openMail.addEventListener('click', () => run(async () => {
  await refreshMail();
  showSquarePanel(mailPanel, openMail, true);
 }));
 mailRefresh.addEventListener('click', () => run(() => refreshMail()));
 mailMore.addEventListener('click', () => run(() => nextMail && refreshMail(nextMail)));
 mailReadAll.addEventListener('click', () => run(async () => {
  await api('game', '/mail/read-all', {});
  await refreshMail();
 }));

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
   return itemRow(definition.name, `数量 ${item.quantity} · ${definition.description}`, '使用', openRename);
  }));
 }

 function newRequestId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
 }

 function itemAction(container, feedback, path, body, success) {
  return run(async () => {
   feedback.textContent = '';
   delete feedback.dataset.error;
   const key = JSON.stringify([path, body]);
   const requestId = pendingItemRequests.get(key) ?? newRequestId();
   pendingItemRequests.set(key, requestId);
   try {
    const data = await api('game', path, {...body, request_id:requestId});
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

 function openShop(message = '') {
  return run(async () => {
   shopCatalog = (await api('game', '/shop')).items;
   const feedback = $('town-shop-feedback');
   delete feedback.dataset.error;
   feedback.textContent = message;
   renderShop();
   showSquarePanel(shopPanel, $('open-shop'), true);
  });
 }

 $('open-shop').addEventListener('click', () => openShop());
 $('inventory-open-shop').addEventListener('click', () => openShop());
 function openRename() {
  if (!session.inventory.items.some(item => item.item_id === 'rename_card' && item.quantity > 0)) {
   return openShop('改名需要 1 张改名卡。');
  }
  const feedback = $('town-rename-feedback');
  feedback.textContent = '';
  delete feedback.dataset.error;
  renameForm.reset();
  renameForm.hidden = false;
  showSquarePanel(characterDetailsPanel, openCharacterDetails);
  renameName.focus();
 }
 $('open-rename').addEventListener('click', openRename);
 openInventory.addEventListener('click', () => run(async () => {
  renderPlayer(await api('game', '/session'));
  renderInventory();
  showSquarePanel(inventoryPanel, openInventory, true);
 }));
 renameForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = renameName.value.trim();
  itemAction(characterDetailsPanel, $('town-rename-feedback'), '/items/use',
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
  if (friendView) updateOpponentFriends(data.players);
  currentGuild = guildView ? data.current : null;
  socialForm.hidden = !friendView && (!guildView || Boolean(currentGuild));
  $('town-social-summary').hidden = !currentGuild;
  socialConfirm.hidden = true;
  if (!socialForm.hidden) {
   $('town-social-label').textContent = friendView ? '玩家 UID' : '帮派名称';
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
   empty = '暂时没有帮派。';
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
   empty = '暂无排名。';
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
    renderSocial(await api('game', `/${socialSection}`, {action, ...data}));
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
   const data = await api('game', `/${section}`);
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

 function updatePlayerAvatar(id) {
  const portrait = $('town-player-avatar');
  const src = avatarUrl(id);
  if (portrait.getAttribute('src') !== src) portrait.src = src;
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
     const {avatar_id} = await api('game', '/avatar', {avatar_id:id});
     session.player.avatar_id = avatar_id;
     updatePlayerAvatar(avatar_id);
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
 function weaponInfo(id, move) {
  const info = document.createElement('span');
  const label = document.createElement('strong');
  label.textContent = move.label;
  const detail = document.createElement('small');
  detail.textContent = `${weaponMoveLabel(move)} · 基础伤害 ${move.damage}`;
  info.append(label, detail);
  if (weaponEffects[id]) {
   const effect = document.createElement('small');
   effect.className = 'town-weapon-effect';
   effect.textContent = weaponEffects[id];
   info.append(effect);
  }
  return info;
 }

 function weaponCard(id, move) {
  const item = document.createElement('li');
  const icon = document.createElement('span');
  icon.className = 'town-item-icon';
  icon.textContent = move.icon || '⚔';
  icon.setAttribute('aria-hidden', 'true');
  item.append(icon, weaponInfo(id, move));
  return item;
 }

 function closeWeaponTip() {
  if (!weaponTipTrigger) return;
  weaponTipTrigger.removeAttribute('aria-describedby');
  weaponTip.hidePopover();
  weaponTipTrigger = undefined;
 }

 function showWeaponTip(trigger, id, move, owned) {
  if (weaponTipTrigger === trigger) return;
  closeWeaponTip();
  const state = document.createElement('small');
  state.textContent = owned ? '已拥有' : '未获得';
  weaponTip.replaceChildren(weaponInfo(id, move), state);
  weaponTip.showPopover();
  weaponTipTrigger = trigger;
  trigger.setAttribute('aria-describedby', weaponTip.id);
  positionWeaponTip();
 }

 function positionWeaponTip() {
  if (!weaponTipTrigger) return;
  const rect = weaponTipTrigger.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
   closeWeaponTip();
   return;
  }
  const top = rect.top > weaponTip.offsetHeight + 12 ? rect.top - weaponTip.offsetHeight - 6 : rect.bottom + 6;
  const x = rect.left + (rect.width - weaponTip.offsetWidth) / 2;
  weaponTip.style.left = `${Math.max(8, Math.min(x, document.documentElement.clientWidth - weaponTip.offsetWidth - 8))}px`;
  weaponTip.style.top = `${Math.max(8, Math.min(top, window.innerHeight - weaponTip.offsetHeight - 8))}px`;
 }

 function boardWeapon(id, move, owned) {
  const item = document.createElement('li');
  const trigger = document.createElement('button');
  const icon = document.createElement('span');
  const name = document.createElement('span');
  trigger.type = 'button';
  trigger.toggleAttribute('data-unowned', !owned);
  icon.className = 'town-board-icon';
  icon.textContent = {blade:'🗡️', sword:'⚔️'}[id] ?? (move.icon || '⚔️');
  icon.setAttribute('aria-hidden', 'true');
  name.textContent = move.label;
  trigger.append(icon, name);
  item.append(trigger);
  const show = () => showWeaponTip(trigger, id, move, owned);
  trigger.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') show(); });
  trigger.addEventListener('pointerleave', event => {
   if (event.pointerType === 'mouse' && !trigger.matches(':focus-visible')) closeWeaponTip();
  });
  trigger.addEventListener('focus', () => { if (trigger.matches(':focus-visible')) show(); });
  trigger.addEventListener('blur', closeWeaponTip);
  trigger.addEventListener('click', show);
  return item;
 }

 document.addEventListener('pointerdown', event => {
  if (!weaponTipTrigger?.contains(event.target)) closeWeaponTip();
 });
 document.addEventListener('keydown', event => { if (event.key === 'Escape') closeWeaponTip(); });
 window.addEventListener('resize', positionWeaponTip);
 window.addEventListener('scroll', positionWeaponTip, {passive:true});

 function renderWeaponCollection() {
  closeWeaponTip();
  const owned = new Set(session.progression.weapons);
  const catalog = Object.entries(weaponMoves).sort(([a], [b]) => Number(owned.has(b)) - Number(owned.has(a)));
  $('town-weapon-count').textContent = `已收集 ${owned.size} / ${catalog.length}`;
  weaponList.replaceChildren(...catalog.map(([id, move]) => boardWeapon(id, move, owned.has(id))));
 }
 $('open-weapon-collection').addEventListener('click', () => run(async () => {
  renderPlayer(await api('game', '/session'));
  renderWeaponCollection();
  showSquarePanel(weaponPanel, $('open-weapon-collection'), true);
 }));
 openSkillCollection.addEventListener('click', () => {
  showSquarePanel(skillPanel, openSkillCollection, true);
 });
 function lock(value) {
  busy = value;
  updateDailyClaim();
  $('login-submit').disabled = value;
  refreshOpponentsButton.disabled = value;
  $('online-logout').disabled = value;
  $('toggle-register').disabled = value;
  savedAccount.disabled = value;
  $('saved-login').disabled = value;
  $('saved-forget').disabled = value;
  $('open-weapon-collection').disabled = value;
  openHistory.disabled = value;
  openPlayerLog.disabled = playerLogMore.disabled = value;
  openMail.disabled = mailRefresh.disabled = mailMore.disabled = value;
  mailReadAll.disabled = value || !unreadMail;
  openCharacterDetails.disabled = value;
  openSkillCollection.disabled = value;
  closeOpponentProfile.disabled = value;
  challengeOpponentProfile.disabled = value;
  avatarPicker.disabled = value;
  for (const id of ['open-shop', 'open-inventory', 'inventory-open-shop', 'open-rename', 'town-rename-submit']) $(id).disabled = value;
  for (const id of ['open-rankings', 'open-guilds', 'open-friends', 'town-social-submit']) $(id).disabled = value;
  socialInput.disabled = value;
  socialLeave.disabled = value;
  renameName.disabled = value;
  for (const list of [shopItems, inventoryItems, socialList]) {
   for (const button of list.querySelectorAll('button')) button.disabled = value || button.hasAttribute('data-unavailable');
  }
  for (const button of avatarOptions.querySelectorAll('button')) button.disabled = value;
  for (const list of [townHistory, mailList]) {
   for (const button of list.querySelectorAll('button')) button.disabled = value;
  }
  for (const button of opponentsList.querySelectorAll('button')) button.disabled = value || button.hasAttribute('data-unavailable');
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
     const action = event.source_id === 'combo' ? '追加连击' : event.source_type === 'effect' ? '追击' : '出招';
     item.textContent = `${action}「${move}」${critical}，${defender} 扣血 ${event.applied_damage}${calculated}，剩余生命 ${event.remaining_hp}。`;
    }
    events.append(item);
    for (const effect of event.effects ?? []) {
     const text = effectText(effect, names);
     if (!text) continue;
     const note = document.createElement('li');
     note.className = 'town-battle-effect';
     note.textContent = text;
     events.append(note);
    }
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

 function setMailCount(count) {
  unreadMail = count;
  mailCount.hidden = !count;
  mailCount.textContent = count > 99 ? '99+' : count;
  openMail.setAttribute('aria-label', count ? `邮件，${count} 封未读` : '邮件');
  mailReadAll.toggleAttribute('data-unavailable', !count);
  mailReadAll.disabled = busy || !count;
 }

 async function refreshMailCount() {
  const {unread} = await api('game', '/mail/unread');
  setMailCount(unread);
 }

 window.setInterval(async () => {
  if (!session || busy || document.hidden || !mailPanel.hidden) return;
  const current = session;
  try {
   const {unread} = await api('game', '/mail/unread');
   if (session === current && !busy && mailPanel.hidden) setMailCount(unread);
  } catch {
   // Entering or opening the inbox retries the request through the regular UI.
  }
 }, 30000);

 function battleDate(report, time) {
  const playedAt = new Date(Number(report.created_at_epoch) * 1000);
  if (Number.isFinite(playedAt.getTime())) {
   time.dateTime = playedAt.toISOString();
   return historyTimeFormat.format(playedAt);
  }
  return report.created_at?.slice(0, 19) ?? '';
 }

 function makeRematchButton(report, matchLabel) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'town-rematch';
  button.disabled = busy;
  button.textContent = '回敬';
  button.setAttribute('aria-label', `回敬，${matchLabel}`);
  button.addEventListener('click', () => run(() => challenge(null, report.battle_id)));
  return button;
 }

 function playerLogText({kind, data}) {
  if (kind === 'challenge' || kind === 'defense') {
   const side = kind === 'challenge' ? 'left' : 'right';
   const outcome = data.winner === 'draw' ? '平局' : data.winner === side ? '获胜' : '落败';
   return (kind === 'challenge' ? `挑战 ${data.opponent}` : `${data.opponent} 挑战了你`) + ` · ${outcome}`;
  }
  if (kind === 'daily_task') return '领取每日乐斗奖励';
  if (kind === 'purchase') return `花费 ${data.coins} 金币购买 ${itemDetails[data.item_id]?.name ?? data.item_id}`;
  if (kind === 'rename') return `将角色名从 ${data.old_name} 改为 ${data.name}`;
  if (kind === 'grant') {
   const catalog = data.kind === 'weapon' ? weaponMoves : itemDetails;
   const name = catalog[data.asset_id]?.label ?? catalog[data.asset_id]?.name ?? data.asset_id;
   return `收到 ${name}${data.quantity > 1 ? ` × ${data.quantity}` : ''}`;
  }
  return '玩家活动';
 }

 async function refreshPlayerLog(before) {
  const {entries, next_before} = await api('game', before ? `/player-log/before/${before}` : '/player-log');
  if (!before) playerLogList.replaceChildren();
  for (const entry of entries) {
   const row = document.createElement('li');
   const details = document.createElement('div');
   const label = document.createElement('strong');
   const time = document.createElement('time');
   details.className = 'town-history-details';
   label.textContent = playerLogText(entry);
   time.textContent = battleDate(entry, time);
   details.append(label);
   const reward = entry.data.reward;
   if (reward) {
    const summary = document.createElement('span');
    const weapon = weaponMoves[reward.weapon_id]?.label ?? reward.weapon_id;
    summary.textContent = [
     `+${reward.xp} 经验`,
     reward.level_up && `升至 Lv. ${reward.level}`,
     weapon && `获得武器 ${weapon}`,
    ].filter(Boolean).join(' · ');
    details.append(summary);
   }
   details.append(time);
   row.append(details);
   playerLogList.append(row);
  }
  $('town-player-log-empty').hidden = Boolean(playerLogList.children.length);
  nextPlayerLog = next_before;
  playerLogMore.hidden = !nextPlayerLog;
 }

 async function refreshMail(before) {
  const {messages:letters, unread, next_before} = await api('game', before ? `/mail/before/${before}` : '/mail');
  if (!before) mailList.replaceChildren();
  for (const letter of letters) {
   const item = document.createElement('li');
   const info = document.createElement('div');
   const details = document.createElement('span');
   const subject = document.createElement('span');
   const time = document.createElement('time');
   const content = document.createElement('div');
   const body = document.createElement('p');
   const actions = document.createElement('div');
   const read = document.createElement('button');
   item.toggleAttribute('data-unread', letter.unread);
   info.className = 'town-history-info';
   details.className = 'town-history-details';
   subject.textContent = letter.subject;
   time.textContent = battleDate(letter, time);
   details.append(subject, time);
   info.append(details);
   content.className = 'town-mail-body';
   content.hidden = true;
   body.textContent = letter.body;
   content.append(body);
   actions.className = 'town-history-actions';
   read.type = 'button';
   read.disabled = busy;
   read.textContent = '查看邮件';
   read.setAttribute('aria-expanded', 'false');
   read.setAttribute('aria-label', `${letter.unread ? '未读，' : ''}查看邮件，${letter.subject}`);
   read.addEventListener('click', () => run(async () => {
    if (item.hasAttribute('data-unread')) {
     const {unread} = await api('game', `/mail/${letter.mail_id}/read`, {});
     setMailCount(unread);
     item.removeAttribute('data-unread');
     read.setAttribute('aria-label', `查看邮件，${letter.subject}`);
    }
    content.hidden = !content.hidden;
    read.setAttribute('aria-expanded', String(!content.hidden));
   }));
   actions.append(read);
   item.append(info, actions, content);
   mailList.append(item);
  }
  nextMail = next_before;
  mailMore.hidden = !nextMail;
  $('town-mail-empty').hidden = Boolean(mailList.children.length);
  setMailCount(unread);
 }

 async function refreshHistory() {
  const {battles} = await api('game', '/battles');
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
   name.textContent = report.side === 'right' ? `${report.opponent} 挑战了你` : report.opponent;
   time.textContent = battleDate(report, time);
   details.append(name, time);
   const outcome = report.winner === 'draw' ? 'draw' : report.winner === (report.side ?? 'left') ? 'left' : 'right';
   result.className = `town-outcome town-outcome-${outcome}`;
   result.textContent = {left:'胜', right:'负', draw:'平'}[outcome];
   info.append(details, result);
   const matchLabel = `${report.opponent}，${time.textContent}`;
   const path = `/battles/${report.battle_id}`;
   playButton.type = 'button';
   playButton.disabled = busy;
   playButton.textContent = '播放';
   playButton.setAttribute('aria-label', `播放，${matchLabel}`);
   playButton.addEventListener('click', () => run(async () => playback(await api('game', path))));
   reportButton.type = 'button';
   reportButton.disabled = busy;
   reportButton.textContent = '文字战报';
   reportButton.setAttribute('aria-label', `文字战报，${matchLabel}`);
   reportButton.addEventListener('click', () => run(async () => {
    const battle = await api('game', path);
    showDamageReport(battle, time.textContent);
   }));
   actions.append(reportButton, playButton);
   if (report.side === 'right') actions.append(makeRematchButton(report, matchLabel));
   item.append(info, actions);
   townHistory.append(item);
  }
 }

 function updateOpponentFriends(players) {
  opponentFriendStates.clear();
  for (const player of players) opponentFriendStates.set(player.player_id, player.status);
  for (const button of opponentsList.querySelectorAll('.town-add-friend')) {
   const state = opponentFriendStates.get(button.dataset.playerId);
   button.textContent = {friend:'已加', outgoing:'已申请', incoming:'同意'}[state] ?? '加';
   const action = {friend:'已是好友', outgoing:'已发送好友申请', incoming:'同意好友申请'}[state] ?? '加好友';
   button.setAttribute('aria-label', `${action}，${button.dataset.playerName}`);
   button.toggleAttribute('data-unavailable', state === 'friend' || state === 'outgoing');
   button.disabled = busy || button.hasAttribute('data-unavailable');
  }
 }

 async function openOpponentProfile(opponent, trigger) {
  const {player, progression} = await api('game', `/players/${opponent.player_id}`);
  if (opponentPanel.hidden) {
   opponentReturn = {
    panel:squarePanels.find(panel => !panel.hidden) ?? historyPanel,
    button:lobby.querySelector('button[aria-pressed="true"][aria-controls]'),
    trigger,
   };
  } else {
   opponentReturn.trigger = trigger;
  }
  viewedOpponent = opponent;
  $('town-opponent-portrait').src = avatarUrl(player.avatar_id);
  $('town-opponent-name').textContent = player.name;
  $('town-opponent-uid').textContent = player.is_ai ? 'AI 陪练' : `UID ${player.player_id}`;
  challengeOpponentProfile.setAttribute('aria-label', `挑战 ${player.name}，UID ${player.player_id}`);
  $('town-opponent-level').textContent = `Lv. ${progression.level}`;
  $('town-opponent-xp').max = progression.next_level_xp;
  $('town-opponent-xp').value = progression.xp;
  $('town-opponent-xp-text').textContent = `${progression.xp} / ${progression.next_level_xp} 经验`;
  $('town-opponent-hp').textContent = player.max_hp;
  $('town-opponent-attack').textContent = player.attack;
  $('town-opponent-defense').textContent = player.defense;
  $('town-opponent-weapon-count').textContent = `已收集 ${progression.weapons.length} 把`;
  $('town-opponent-weapons').replaceChildren(...progression.weapons.filter(id => weaponMoves[id])
   .map(id => weaponCard(id, weaponMoves[id])));
  $('town-opponent-weapons-empty').hidden = progression.weapons.length > 0;
  const skills = $('town-opponent-skills');
  skills.replaceChildren();
  if (player.skill_id === 'combo') {
   const combo = $('town-combo-skill').cloneNode(true);
   combo.removeAttribute('id');
   combo.hidden = false;
   skills.append(combo);
  }
  $('town-opponent-skills-empty').hidden = skills.childElementCount > 0;
  showSquarePanel(opponentPanel, null, true);
 }

 closeOpponentProfile.addEventListener('click', () => {
  if (!opponentReturn) return;
  const {panel, button, trigger} = opponentReturn;
  showSquarePanel(panel, button, true);
  (trigger.isConnected ? trigger : refreshOpponentsButton).focus({preventScroll:true});
 });
 challengeOpponentProfile.addEventListener('click', () => {
  if (viewedOpponent) run(() => challenge(viewedOpponent));
 });

 async function refreshOpponents() {
  const [{opponents}, {players}] = await Promise.all([
   api('game', '/opponents', {previous_ids:recentOpponentIds}),
   api('game', '/friends'),
  ]);
  const rows = opponents.map(player => {
   const row = document.createElement('li');
   const profile = document.createElement('button');
   const avatar = document.createElement('img');
   const details = document.createElement('span');
   const name = document.createElement('strong');
   const level = document.createElement('small');
   const actions = document.createElement('span');
   const addFriend = document.createElement('button');
   const button = document.createElement('button');
   profile.type = 'button';
   profile.className = 'town-opponent-link';
   profile.disabled = busy;
   profile.setAttribute('aria-controls', 'town-opponent-panel');
   profile.setAttribute('aria-label', `查看 ${player.name} 的养成详情，UID ${player.player_id}`);
   profile.title = `查看 ${player.name} 的养成详情`;
   profile.addEventListener('click', () => run(() => openOpponentProfile(player, profile)));
   avatar.className = 'town-opponent-avatar';
   avatar.src = avatarUrl(player.avatar_id);
   avatar.alt = '';
   details.className = 'town-opponent-details';
   name.textContent = player.name;
   level.textContent = `Lv. ${player.level}`;
   if (player.is_ai) {
    level.textContent += ' · AI 陪练';
    level.className = 'town-ai-label';
   }
   details.append(name, level);
   actions.className = 'town-opponent-actions';
   addFriend.type = 'button';
   addFriend.className = 'town-add-friend';
   addFriend.dataset.playerId = player.player_id;
   addFriend.dataset.playerName = player.name;
   addFriend.addEventListener('click', () => run(async () => {
    const action = opponentFriendStates.get(player.player_id) === 'incoming' ? 'accept' : 'request';
    const {players: friends} = await api('game', '/friends', {action, player_id:player.player_id});
    if (socialSection === 'friends' && !socialPanel.hidden) renderSocial({players:friends});
    else updateOpponentFriends(friends);
   }));
   button.type = 'button';
   button.disabled = busy;
   button.textContent = '挑战';
   button.setAttribute('aria-label', `挑战 ${player.name}，UID ${player.player_id}`);
   button.addEventListener('click', () => run(() => challenge(player)));
   if (!player.is_ai) actions.append(addFriend);
   actions.append(button);
   profile.append(avatar, details);
   row.append(profile, actions);
   return row;
  });
  await Promise.all(rows.map(row => row.querySelector('img').decode().catch(() => {})));
  opponentsList.replaceChildren(...rows);
  updateOpponentFriends(players);
  recentOpponentIds = opponents.map(player => player.player_id);
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
    session = pending = lastReport = null;
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
  const {accounts} = await api('account', '/remembered');
  const previous = savedAccount.value;
  savedAccount.replaceChildren(...accounts.map(name => new Option(name, name)));
  if (accounts.includes(previous)) savedAccount.value = previous;
  $('saved-account-panel').hidden = registering || !accounts.length;
 }

 async function finishLogin(data) {
  username.value = data.username;
  setRegistration(false);
  await enterGame();
  accountFeedback.textContent = '';
 }

 $('saved-login').addEventListener('click', () => run(async () => {
  const selected = savedAccount.value;
  try {
   await finishLogin(await api('account', '/remembered/login', {username:selected}));
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
  await api('account', '/remembered/forget', {username:savedAccount.value});
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
   : '登录账号，回到你的企鹅小镇。';
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
   await finishLogin(await api('account', registering ? '/register' : '/login', {
    username:username.value.trim(), password:password.value, remember:$('remember-account').checked,
   }));
  });
 });

 function returnToSquare() {
  showEntry();
  townStage.focus();
 }

 closeBattleResult.addEventListener('click', returnToSquare);

 async function challenge(target, originalBattleId) {
  prepareSound();
  playMusic();
  const path = originalBattleId ? `/battles/${originalBattleId}/rematch` : '/battles';
  const key = originalBattleId ?? target.player_id;
  if (pending?.key !== key) pending = {key, request_id:newRequestId()};
  const {request_id} = pending;
  const body = originalBattleId ? {request_id}
   : {request_id, target_player_id:target.player_id};
  let report;
  try {
   report = await api('game', path, body);
  } catch (error) {
   if (error.code && error.code !== 'unavailable') pending = null;
   throw error;
  }
  pending = null;
  const reward = report.reward;
  const weapon = weaponMoves[reward?.weapon_id];
  let rewardText = reward ? `+${reward.xp} 经验` : '';
  if (reward?.level_up) rewardText += ` · 升至 Lv. ${reward.level} · ${weapon ? '获得' + weapon.label : '武器已集齐'}`;
  await playback(report, rewardText);
  await Promise.all([
   refreshHistory(),
   refreshMailCount(),
   api('game', '/session').then(renderPlayer),
  ]);
 }

 refreshOpponentsButton.addEventListener('click', async () => {
  if (busy) return;
  lobby.classList.add('is-refreshing-opponents');
  opponentsList.setAttribute('aria-busy', 'true');
  try {
   await run(refreshOpponents);
  } finally {
   lobby.classList.remove('is-refreshing-opponents');
   opponentsList.removeAttribute('aria-busy');
  }
 });

 function logout() {
  return run(async () => {
   await api('account', '/logout', {});
   session = pending = lastReport = null;
   showEntry();
   await refreshSavedAccounts();
   requestAnimationFrame(() => ($('saved-account-panel').hidden ? username : savedAccount).focus());
  });
 }
 $('online-logout').addEventListener('click', logout);
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
   await enterGame();
  } catch (error) {
   if (error.code !== 'unauthorized') throw error;
   await refreshSavedAccounts();
  }
 });
}
