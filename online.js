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
 const socialTitles = {guilds:'帮派', friends:'好友'};
 const statLabels = {max_hp:'生命', attack:'攻击', defense:'防御'};
 const powerFields = [...Object.keys(statLabels), 'weapons', 'skills'];
 const powerNumber = new Intl.NumberFormat('zh-CN');
 const itemDetails = {rename_card:{name:'改名卡', description:'使用后可修改角色名。', image:'assets/item-rename-card.png'}};
 const pendingItemRequests = new Map();
 const avatarPanel = $('town-avatar-panel');
 const avatarPicker = $('open-avatar-picker');
 const avatarOptions = $('town-avatar-options');
 const avatarFeedback = $('town-avatar-feedback');
 const avatarChoices = {blue:'蓝围巾', red:'红围巾', green:'薄荷帽', gold:'星星领结'};
 const battleView = $('town-battle-view');
 const panelLayer = $('town-panel-layer');
 const closeTownPanel = $('close-town-panel');
 const townFeedback = $('town-feedback');
 const staminaDisplay = $('town-stamina');
 const closeBattleResult = $('close-battle-result');
 const accountFeedback = $('account-feedback');
 const loginForm = $('online-login');
 const townHistory = $('town-battle-history');
 const damagePanel = $('town-damage-panel');
 const weaponPanel = $('town-weapon-panel');
 const weaponList = $('town-weapon-list');
 const collectionTip = $('town-collection-tip');
 const starterGuide = $('town-starter');
 const starterFight = $('town-starter-fight');
 const starterNext = $('town-starter-next');
 const starterPlazaChoice = $('town-starter-plaza-choice');
 const starterResultChoice = $('town-starter-result-choice');
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
 const chatPanel = $('town-chat-panel');
 const openChat = $('open-chat');
 const chatFeed = $('town-chat-feed');
 const chatMessages = $('town-chat-messages');
 const chatForm = $('town-chat-form');
 const chatText = $('town-chat-text');
 const chatSend = $('town-chat-send');
 const chatFeedback = $('town-chat-feedback');
 const characterDetailsPanel = $('town-character-details-panel');
 const openCharacterDetails = $('open-character-details');
 const skillPanel = $('town-skill-panel');
 const openSkillCollection = $('open-skill-collection');
 const skillList = $('town-skill-list');
 const trialPanel = $('town-trial-panel');
 const dungeonPanel = $('town-dungeon-panel');
 const openDungeons = $('open-dungeons');
 const enterTrialDungeon = $('enter-trial-dungeon');
 const backToDungeons = $('back-to-dungeons');
 const trialList = $('town-trial-list');
 const pinnedTrials = $('town-pinned-trials');
 const pinnedTrialList = $('town-pinned-trial-list');
 const openPinnedTrials = $('town-pinned-title');
 const pinnedTrialIds = new Set(['9000000000000001001', '9000000000000001002', '9000000000000001004']);
 const opponentPanel = $('town-opponent-panel');
 const closeOpponentProfile = $('close-opponent-profile');
 const challengeOpponentProfile = $('challenge-opponent-profile');
 const rankingsPanel = $('town-rankings-panel');
 const openRankings = $('open-rankings');
 const rankingButtons = rankingsPanel.querySelectorAll('[data-category]');
 const rankingList = $('town-rankings-list');
 const rankingSelf = $('town-ranking-self');
 const rankingFeedback = $('town-ranking-feedback');
 let rankingRequest;
 const squarePanels = [historyPanel, playerLogPanel, characterDetailsPanel, skillPanel, inventoryPanel, shopPanel, socialPanel, rankingsPanel,
  avatarPanel, damagePanel, weaponPanel, opponentPanel, mailPanel, chatPanel, dungeonPanel, trialPanel];
 const squarePanelButtons = lobby.querySelectorAll('button[aria-pressed][aria-controls]');
 const opponentsList = $('town-opponents');
 const opponentsEmpty = $('town-opponents-empty');
 const refreshOpponentsButton = $('refresh-opponents');
 const opponentsSidebar = $('town-opponents-sidebar');
 const openOpponents = $('open-opponents');
 const closeOpponents = $('close-opponents');
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
 let chatCursor;
 let chatLoading = false;
 let pendingChat;
 let chatGeneration = 0;
 let nextPlayerLog;
 let collectionTipTrigger;
 let dailyTask;
 let dailyResetTimer;
 let staminaTimer;
 let staminaRequest;
 const dailyTasks = $('town-tasks');
 const dailyToggle = $('town-daily-toggle');
 const dailyLayer = $('town-daily-layer');
 const dailyClose = $('town-daily-close');
 const dailyClaim = $('town-daily-claim');
 const opponentFriendStates = new Map();

 const messages = {
  unauthorized: '登录已失效，请重新登录。',
  invalid_credentials: '账号或密码有误，请检查后重试。',
  invalid_registration: '请使用 3–32 位字母、数字或下划线作为账号。',
  account_taken: '这个账号已被注册，可以直接登录或换一个账号。',
  remember_expired: '这个账号的免密登录已过期，请输入密码重新登录。',
  player_not_entered: '请重新进入游戏。',
  starter_not_ready: '完成第一场乐斗后即可领取。',
  starter_already_chosen: '你已选过新手武器。',
  starter_battle_unavailable: '该场新手引导已更新，请刷新广场再试。',
  trial_locked: '先战胜上一关，才能挑战这位对手。',
  rate_limited: '登录尝试较多，请稍后重试。',
  chat_rate_limited: '发得太快，请稍等再试。',
  chat_invalid_text: '请输入 1–200 个字，消息须为单行。',
  not_found: '没有找到该角色或战报。',
  same_player: '请选择其他玩家。',
  invalid_request: '请检查角色 UID。',
  request_conflict: '请求编号已被使用，请重新选择对手。',
  task_incomplete: '今日乐斗次数还不够。',
  task_claimed: '今日经验已领取。',
  task_reset: '每日任务已刷新。',
  invalid_character_name: '请使用 2–16 个汉字、字母、数字或下划线。',
  insufficient_coins: '金币不足。',
  insufficient_stamina: '体力不足，恢复后再来挑战。',
  missing_item: '背包里没有改名卡。',
  same_name: '请输入和当前角色名不同的名字。',
  name_taken: '这个角色名已被使用，请换一个。',
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

 async function api(service, path, body, signal) {
  const prefix = `api/${service}`;
  const response = await fetch(`${prefix}${path}`, {
   method: body ? 'POST' : 'GET',
   headers: body ? {'Content-Type': 'application/json'} : {},
   body: body ? JSON.stringify(body) : undefined,
   signal,
  });
  if (response.status === 429 && path !== '/chat') throw new Error(messages.rate_limited);
  const data = await response.json();
  if (!response.ok) {
   const error = new Error(messages[data.error] ?? messages.unavailable);
   error.code = data.error;
   if (error.code === 'insufficient_stamina') error.stamina = data.stamina;
   throw error;
  }
  return data;
 }

 function showEntry() {
  clearTimeout(returnToSquareTimer);
  if (!session) {
   clearTimeout(dailyResetTimer);
   clearTimeout(staminaTimer);
   staminaRequest?.abort();
   staminaDisplay.hidden = true;
   showDailyDetails(false);
   starterResultChoice.replaceChildren();
   resetChat();
  }
  battleView.hidden = true;
  if (!session) showSquarePanel(null);
  townStage.hidden = false;
  entry.hidden = Boolean(session);
  lobby.hidden = !session;
 }

 async function enterGame() {
  acceptSession(await api('game', '/enter', {}));
  townStage.focus();
  await Promise.all([refreshOpponents(), refreshHistory(), refreshMailCount(), refreshTrials()]);
 }

 function acceptSession(data) {
  pendingItemRequests.clear();
  opponentFriendStates.clear();
  recentOpponentIds = [];
  showDailyDetails(false);
  $('town-daily-result').hidden = true;
  townHistory.replaceChildren();
  rankingList.replaceChildren();
  rankingSelf.replaceChildren();
  $('town-ranking-missing').hidden = true;
  for (const button of rankingButtons) button.setAttribute('aria-pressed', String(button.dataset.category === 'level'));
  mailList.replaceChildren();
  nextMail = null;
  mailMore.hidden = true;
  setMailCount(0);
  renameForm.reset();
  renameForm.hidden = true;
  $('town-rename-feedback').textContent = '';
  showSquarePanel(null);
  renderPlayer(data);
  townFeedback.textContent = '';
  $('town-history-empty').hidden = true;
  opponentsEmpty.hidden = true;
  opponentsList.replaceChildren();
  pinnedTrials.hidden = true;
  pinnedTrialList.replaceChildren();
  trialList.replaceChildren();
  $('town-dungeon-progress').textContent = '';
  $('town-dungeon-next').textContent = '';
  showEntry();
 }

 function renderCombatPower(element, power) {
  element.hidden = !power;
  if (power) element.textContent = `战斗力 ${powerNumber.format(power.total)}`;
 }

 function renderPlayer(data) {
  session = data;
  const {player, progression} = data;
  renderStamina(data.stamina);
  renderDailyTask(data.daily_task);
  $('town-player-name').textContent = player.name;
  updatePlayerAvatar(player.avatar_id);
  $('town-detail-name').textContent = player.name;
  $('town-detail-uid').textContent = player.player_id;
  const power = progression.combat_power;
  renderCombatPower($('town-combat-power'), power);
  renderCombatPower($('town-power-total'), power);
  $('town-power-details').hidden = !power;
  if (power) {
   for (const field of powerFields) $(`town-power-${field}`).textContent = powerNumber.format(power[field]);
  }
  for (const [stat, label] of Object.entries(statLabels)) {
   const id = stat === 'max_hp' ? 'hp' : stat;
   const total = player[stat];
   const growth = player.stat_growth?.[stat] ?? 0;
   $(`town-${id}`).textContent = total;
   $(`town-${id}-breakdown`).textContent = `基础${label} ${total - growth} · 升级成长 +${growth}`;
  }
  if (!skillPanel.hidden) renderTechniques(skillList, progression.techniques);
  $('town-level').textContent = `Lv. ${progression.level}`;
  $('town-xp').max = progression.next_level_xp;
  $('town-xp').value = progression.xp;
  $('town-xp-text').textContent = `${progression.xp} / ${progression.next_level_xp} 经验`;
  $('town-xp-remaining').textContent = `距升级还差 ${progression.next_level_xp - progression.xp} 经验`;
  renderStarter();
  if (!weaponPanel.hidden) renderWeaponCollection();
  $('town-coins').textContent = `${data.inventory.coins} 金币`;
  if (!shopPanel.hidden) renderShop();
  if (!inventoryPanel.hidden) renderInventory();
 }

 function techniqueInfo(technique) {
  const info = document.createElement('span');
  const name = document.createElement('strong');
  const source = document.createElement('small');
  const effect = document.createElement('small');
  name.textContent = technique.name;
  source.textContent = technique.book ? `《${technique.book}》 · ${technique.style}` : '基础招式';
  effect.textContent = technique.description;
  info.append(name, source, effect);
  return info;
 }

 function renderTechniques(container, techniques = []) {
  if (container.contains(collectionTipTrigger)) closeCollectionTip();
  container.replaceChildren(...techniques.map(technique => boardItem({
   label:technique.name,
   icon:collectionArt(`assets/techniques/${encodeURIComponent(technique.id)}.svg`),
   owned:technique.unlocked,
   info:() => techniqueInfo(technique),
   state:technique.unlocked ? '已学会' : '升级随机获得',
  })));
  if (container === skillList) {
   const learned = techniques.filter(technique => technique.unlocked).length;
   $('town-skill-count').textContent = `已学会 ${learned} / ${techniques.length}`;
  }
 }

 function renderStamina(stamina) {
  clearTimeout(staminaTimer);
  staminaRequest?.abort();
  staminaDisplay.hidden = !stamina;
  if (!stamina) return;
  const {current, max, challenge_cost, recovery_per_hour, next_recovery_in} = stamina;
  $('town-trial-cost').textContent = `每场消耗 ${challenge_cost} 点体力。击败当前对手后开放下一关，已通关的对手可再次挑战。`;
  const label = `体力 ${current}/${max}`;
  if (staminaDisplay.textContent !== label) staminaDisplay.textContent = label;
  staminaDisplay.toggleAttribute('data-low', current < challenge_cost);
  staminaDisplay.title = `每场消耗 ${challenge_cost} 点 · 每小时恢复 ${recovery_per_hour} 点`;
  staminaDisplay.setAttribute('aria-label', `${label}，${staminaDisplay.title}`);
  if (next_recovery_in) staminaTimer = setTimeout(refreshStamina, Math.max(5000, next_recovery_in * 1000));
 }

 async function refreshStamina() {
  if (!session || document.hidden) return;
  staminaRequest?.abort();
  const request = new AbortController();
  staminaRequest = request;
  try {
   const stamina = await api('game', '/stamina', undefined, request.signal);
   if (!request.signal.aborted) {
    staminaRequest = null;
    renderStamina(stamina);
   }
  } catch (error) {
   if (!request.signal.aborted && error.code !== 'unauthorized') {
    clearTimeout(staminaTimer);
    staminaTimer = setTimeout(refreshStamina, 15000);
   }
  } finally {
   if (staminaRequest === request) staminaRequest = null;
  }
 }

 document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !busy) refreshStamina();
 });

 const starterDescriptions = {hammer:'碎盾 · 击碎护盾', sword:'破甲 · 无视一半防御', umbrella:'护盾 · 抵挡下一次命中'};

 function renderStarterChoices(container, starter, showTitle) {
  const choice = document.createElement('div');
  const options = document.createElement('div');
  const feedback = document.createElement('p');
  choice.className = 'town-starter-choice';
  options.className = 'town-starter-options';
  feedback.className = 'town-starter-feedback';
  feedback.role = 'status';
  if (showTitle) {
   const title = document.createElement('h3');
   title.textContent = starter.already_owned ? '选一把武器继续' : '自选一把新手武器';
   choice.append(title);
  }
  for (const id of starter.options) {
   const move = weaponMoves[id];
   const button = document.createElement('button');
   const name = document.createElement('strong');
   const effect = document.createElement('small');
   button.type = 'button';
   button.disabled = busy;
   name.textContent = move.label;
   effect.textContent = starterDescriptions[id];
   button.append(name, effect);
   button.addEventListener('click', () => run(async () => {
    feedback.textContent = '';
    try {
     renderPlayer(await api('game', '/starter/claim', {weapon_id:id}));
    } catch (error) {
     if (error.code === 'unauthorized') throw error;
     if (error.code === 'starter_already_chosen' || error.code === 'already_owned') {
      renderPlayer(await api('game', '/session'));
      if (session.starter?.step === 'next_battle') showStarterWeapon();
      else {
       if (container === starterResultChoice && session.starter?.step === 'choose') {
        renderStarterChoices(container, session.starter, true);
       }
       const updated = container.querySelector('.town-starter-feedback');
       if (updated) updated.textContent = '武器库已更新，请重新选择。';
      }
      return;
     }
     feedback.textContent = '暂时无法确认领取结果，请重试。';
     return;
    }
    showStarterWeapon();
   }));
   options.append(button);
  }
  choice.append(options, feedback);
  container.replaceChildren(choice);
 }

 function renderStarter() {
  const {starter, progression} = session;
  starterGuide.hidden = !starter;
  const choose = starter?.step === 'choose';
  const next = starter?.step === 'next_battle';
  starterPlazaChoice.replaceChildren();
  if (choose) renderStarterChoices(starterPlazaChoice, starter, false);
  starterFight.hidden = choose;
  starterFight.textContent = next ? '再打一场' : '开始第一场乐斗';
  $('town-starter-title').textContent = choose ? '首战完成，选一把武器' : next ? '带上新手武器再打一场' : '开始第一场乐斗';
  $('town-starter-copy').textContent = choose
   ? (starter.already_owned ? '三把武器你都已有，选一把继续。' : '武器会加入武器库，下一场有机会抽到。')
   : next ? '下一场有机会抽到刚选的武器。' : '和新手陪练打一场，胜负都能解锁自选武器。';
  $('town-starter-weapon-guide').hidden = !next;
  if (next) {
   const progress = progression.level === 1
    ? `再得 ${progression.next_level_xp - progression.xp} 经验升到 Lv.2，解锁一把武器。`
    : `升到 Lv.${progression.level + 1} 继续解锁武器。`;
   $('town-starter-weapon-copy').textContent = `${weaponMoves[starter.weapon_id].label}已加入武器库。 ${progress}`;
  }
 }

 function showStarterWeapon() {
  returnToSquare();
  renderWeaponCollection();
  showSquarePanel(weaponPanel, $('open-weapon-collection'), true);
 }

 function fightStarter() {
  if (session.starter?.target) run(() => challenge(session.starter.target));
 }
 starterFight.addEventListener('click', fightStarter);
 starterNext.addEventListener('click', fightStarter);

 function updateDailyClaim() {
  dailyClaim.disabled = busy || !dailyTask || dailyTask.claimed || dailyTask.progress < dailyTask.target;
  dailyClaim.toggleAttribute('data-unavailable', !dailyTask || dailyTask.claimed || dailyTask.progress < dailyTask.target);
 }

 function showDailyDetails(open) {
  dailyLayer.hidden = !open;
  dailyToggle.setAttribute('aria-expanded', String(open));
 }

 function closeDailyDetails() {
  showDailyDetails(false);
  dailyToggle.focus({preventScroll:true});
 }

 dailyToggle.addEventListener('click', () => {
  showDailyDetails(true);
  dailyClose.focus({preventScroll:true});
 });
 dailyClose.addEventListener('click', closeDailyDetails);
 dailyLayer.addEventListener('click', event => {
  if (event.target === dailyLayer) closeDailyDetails();
 });
 dailyTasks.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !dailyLayer.hidden) closeDailyDetails();
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
  if (document.activeElement === document.body && !dailyLayer.hidden) dailyClose.focus({preventScroll:true});
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
  if (panel !== rankingsPanel) rankingRequest?.abort();
  if (panel) showDailyDetails(false);
  if (panel !== opponentPanel) {
   viewedOpponent = opponentReturn = null;
  }
  for (const section of squarePanels) section.hidden = section !== panel;
  panelLayer.hidden = !panel;
  if (!panel?.contains(collectionTipTrigger)) closeCollectionTip();
  if (panel === historyPanel) button = openHistory;
  for (const trigger of squarePanelButtons) trigger.setAttribute('aria-pressed', String(trigger === button));
  if (panel && moveFocus) {
   const heading = panel.querySelector('h2');
   panel.scrollTop = 0;
   heading.focus({preventScroll:true});
  }
 }

 function closeSquarePanel() {
  const trigger = [...squarePanelButtons].find(button => button.getAttribute('aria-pressed') === 'true')
   ?? opponentReturn?.trigger;
  showSquarePanel(null);
  (trigger?.isConnected ? trigger : townStage).focus({preventScroll:true});
 }
 closeTownPanel.addEventListener('click', closeSquarePanel);
 panelLayer.addEventListener('click', event => {
  if (event.target === panelLayer) closeSquarePanel();
 });
 lobby.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || event.defaultPrevented) return;
  if (collectionTipTrigger) {
   closeCollectionTip();
  } else if (!panelLayer.hidden) {
   closeSquarePanel();
  }
 });

 async function refreshTrials() {
  const {stages} = await api('game', '/trials');
  const completed = stages.filter(stage => stage.state === 'cleared').length;
  const progress = `已通关 ${completed} / ${stages.length} 关`;
  const next = stages.find(stage => stage.state === 'ready');
  $('town-trial-progress').textContent = progress;
  $('town-dungeon-progress').textContent = progress;
  $('town-dungeon-next').textContent = next ? `下一关 · ${next.name}` : '可重打已通关关卡';
  trialList.replaceChildren(...stages.map(stage => trialRow(stage, false)));
  const pinned = stages.filter(stage => pinnedTrialIds.has(stage.player_id));
  pinnedTrialList.replaceChildren(...pinned.map(stage => trialRow(stage, true)));
  pinnedTrials.hidden = !pinned.length;
 }

 function trialRow(stage, compact) {
   const row = document.createElement('li');
   const portrait = document.createElement('img');
   const info = document.createElement('div');
   const name = document.createElement('strong');
   const stats = document.createElement('small');
   const action = document.createElement(stage.state === 'locked' ? 'span' : 'button');
   row.dataset.state = stage.state;
   portrait.src = avatarUrl(stage.avatar_id);
   portrait.alt = '';
   name.textContent = compact ? stage.name : `${stage.name} · ${stage.title}`;
   stats.textContent = compact ? `推荐 Lv. ${stage.recommended_level}`
    : `推荐 Lv. ${stage.recommended_level} · 战斗力 ${powerNumber.format(stage.combat_power)}`;
   info.append(name, stats);
   if (stage.state === 'locked') {
    action.textContent = '未开放';
   } else {
    action.type = 'button';
    action.className = 'town-item-action';
    action.disabled = busy;
    const label = stage.state === 'cleared' ? '再次挑战' : '挑战';
    action.textContent = compact && stage.state === 'cleared' ? '重打' : label;
    action.setAttribute('aria-label', `${label}${stage.name}`);
    action.addEventListener('click', () => run(() => challenge(stage)));
   }
   row.append(portrait, info, action);
   return row;
 }

 openDungeons.addEventListener('click', () => run(async () => {
  await refreshTrials();
  showSquarePanel(dungeonPanel, openDungeons, true);
 }));
 enterTrialDungeon.addEventListener('click', () => showSquarePanel(trialPanel, openDungeons, true));
 backToDungeons.addEventListener('click', () => {
  showSquarePanel(dungeonPanel, openDungeons, true);
  enterTrialDungeon.focus({preventScroll:true});
 });
 openPinnedTrials.addEventListener('click', () => run(async () => {
  await refreshTrials();
  showSquarePanel(trialPanel, openPinnedTrials, true);
 }));

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

 function itemRow(name, description, action, onClick, disabled = false, image) {
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
  if (image) {
   const icon = document.createElement('img');
   icon.className = 'town-item-art';
   icon.src = image;
   icon.alt = '';
   icon.width = icon.height = 62;
   row.append(icon);
  }
  row.append(info, button);
  return row;
 }

 function renderShop() {
  const {coins} = session.inventory;
  $('town-shop-coins').textContent = `金币余额 ${coins}`;
  shopItems.replaceChildren(...shopCatalog.map(item => {
   const affordable = coins >= item.price;
   const definition = itemDetails[item.id];
   const description = definition?.description;
   return itemRow(item.name, description ? `${description} ${item.price} 金币` : `${item.price} 金币`,
    affordable ? '购买' : '金币不足', () => itemAction(shopPanel, $('town-shop-feedback'), '/shop/buy',
     {item_id:item.id}, `已购买「${item.name}」，可在背包查看。`), !affordable, definition?.image);
  }));
 }

 function renderInventory() {
  const {items} = session.inventory;
  $('town-inventory-empty').hidden = items.length > 0;
  inventoryItems.replaceChildren(...items.map(item => {
   const definition = itemDetails[item.item_id];
   if (item.item_id !== 'rename_card') return itemRow(definition?.name ?? item.item_id,
    `数量 ${item.quantity}`, '暂不可使用', () => {}, true);
   return itemRow(definition.name, `数量 ${item.quantity} · ${definition.description}`, '使用', openRename, false, definition.image);
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
  } else {
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
  }
  socialList.replaceChildren(...rows);
  $('town-social-empty').hidden = rows.length > 0;
  $('town-social-empty').textContent = empty ?? '';
 }

 const rankingDetails = {
  level: player => `Lv. ${player.level} · ${player.xp}/100 经验`,
  wins: player => `主动挑战获胜 ${player.score} 场`,
  weapons: player => `已收藏 ${player.score} 把武器`,
 };

 function updateRankingRows(list, players, category) {
  players.forEach((player, index) => {
   const title = `第 ${player.rank} 名 · ${player.name}`;
   const detail = rankingDetails[category](player);
   const row = list.children[index];
   if (!row) {
    list.append(socialPlayerRow(player, detail, title));
    return;
   }
   const [portrait, info] = row.children;
   const src = avatarUrl(player.avatar_id);
   if (portrait.getAttribute('src') !== src) portrait.src = src;
   if (info.firstElementChild.textContent !== title) info.firstElementChild.textContent = title;
   if (info.lastElementChild.textContent !== detail) info.lastElementChild.textContent = detail;
   row.toggleAttribute('data-self', player.player_id === session.player.player_id);
  });
  while (list.children.length > players.length) list.lastElementChild.remove();
 }

 async function refreshRankings(category) {
  rankingRequest?.abort();
  const request = new AbortController();
  rankingRequest = request;
  rankingFeedback.textContent = '';
  rankingList.setAttribute('aria-busy', 'true');
  try {
   const {players, self} = await api('game', `/rankings/${category}`, undefined, request.signal);
   if (request.signal.aborted) return;
   updateRankingRows(rankingList, players, category);
   updateRankingRows(rankingSelf, self ? [self] : [], category);
   $('town-ranking-missing').hidden = Boolean(self);
   for (const button of rankingButtons) button.setAttribute('aria-pressed', String(button.dataset.category === category));
   $('town-rankings-scroll').scrollTop = 0;
  } catch (error) {
   if (request.signal.aborted) return;
   if (error.code === 'unauthorized' && !busy) {
    await run(() => { throw error; });
   } else {
    rankingFeedback.textContent = error.code === 'unauthorized' ? messages.unauthorized : '排行榜暂时无法加载，请重试。';
   }
  } finally {
   if (rankingRequest === request) rankingList.removeAttribute('aria-busy');
  }
 }

 openRankings.addEventListener('click', () => {
  if (busy) return;
  showSquarePanel(rankingsPanel, openRankings, true);
  const selected = [...rankingButtons].find(button => button.getAttribute('aria-pressed') === 'true');
  refreshRankings(selected.dataset.category);
 });
 for (const button of rankingButtons) {
  button.addEventListener('click', () => refreshRankings(button.dataset.category));
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
  if (id === 'blade') icon.append(collectionArt('assets/weapon-guandao.svg'));
  else icon.textContent = move.icon || '⚔';
  icon.setAttribute('aria-hidden', 'true');
  item.append(icon, weaponInfo(id, move));
  return item;
 }

 function closeCollectionTip() {
  if (!collectionTipTrigger) return;
  collectionTipTrigger.removeAttribute('aria-describedby');
  collectionTip.hidePopover();
  collectionTipTrigger = undefined;
 }

 function showCollectionTip(trigger, info, label) {
  if (collectionTipTrigger === trigger) return;
  closeCollectionTip();
  const state = document.createElement('small');
  state.textContent = label;
  collectionTip.replaceChildren(info(), state);
  collectionTip.showPopover();
  collectionTipTrigger = trigger;
  trigger.setAttribute('aria-describedby', collectionTip.id);
  positionCollectionTip();
 }

 function positionCollectionTip() {
  if (!collectionTipTrigger) return;
  const rect = collectionTipTrigger.getBoundingClientRect();
  if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
   closeCollectionTip();
   return;
  }
  const top = rect.top > collectionTip.offsetHeight + 12 ? rect.top - collectionTip.offsetHeight - 6 : rect.bottom + 6;
  const x = rect.left + (rect.width - collectionTip.offsetWidth) / 2;
  collectionTip.style.left = `${Math.max(8, Math.min(x, document.documentElement.clientWidth - collectionTip.offsetWidth - 8))}px`;
  collectionTip.style.top = `${Math.max(8, Math.min(top, window.innerHeight - collectionTip.offsetHeight - 8))}px`;
 }

 function collectionArt(path) {
  const image = document.createElement('img');
  image.className = 'town-collection-art';
  image.src = path;
  image.alt = '';
  return image;
 }

 function boardItem({label, icon, owned, starter, info, state}) {
  const item = document.createElement('li');
  const trigger = document.createElement('button');
  const badge = document.createElement('span');
  const name = document.createElement('span');
  trigger.type = 'button';
  trigger.toggleAttribute('data-starter', Boolean(starter));
  trigger.toggleAttribute('data-unowned', !owned);
  badge.className = 'town-board-icon';
  badge.setAttribute('aria-hidden', 'true');
  badge.append(icon);
  name.textContent = label;
  trigger.append(badge, name);
  item.append(trigger);
  const show = () => showCollectionTip(trigger, info, state);
  trigger.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') show(); });
  trigger.addEventListener('pointerleave', event => {
   if (event.pointerType === 'mouse' && !trigger.matches(':focus-visible')) closeCollectionTip();
  });
  trigger.addEventListener('focus', () => { if (trigger.matches(':focus-visible')) show(); });
  trigger.addEventListener('blur', closeCollectionTip);
  trigger.addEventListener('click', show);
  return item;
 }

 document.addEventListener('pointerdown', event => {
  if (!collectionTipTrigger?.contains(event.target)) closeCollectionTip();
 });
 window.addEventListener('resize', positionCollectionTip);
 window.addEventListener('scroll', positionCollectionTip, {capture:true, passive:true});

 function renderWeaponCollection() {
  closeCollectionTip();
  const owned = new Set(session.progression.weapons);
  const catalog = Object.entries(weaponMoves).sort(([a], [b]) => Number(owned.has(b)) - Number(owned.has(a)));
  $('town-weapon-count').textContent = `已收集 ${owned.size} / ${catalog.length}`;
  weaponList.replaceChildren(...catalog.map(([id, move]) => boardItem({
   label:move.label,
   icon:id === 'blade' ? collectionArt('assets/weapon-guandao.svg') : move.icon || '⚔️',
   owned:owned.has(id),
   starter:session.starter?.weapon_id === id,
   info:() => weaponInfo(id, move),
   state:owned.has(id) ? '已拥有' : '未获得',
  })));
 }
 $('open-weapon-collection').addEventListener('click', () => run(async () => {
  renderPlayer(await api('game', '/session'));
  renderWeaponCollection();
  showSquarePanel(weaponPanel, $('open-weapon-collection'), true);
 }));
 openSkillCollection.addEventListener('click', () => {
  renderTechniques(skillList, session.progression.techniques);
  showSquarePanel(skillPanel, openSkillCollection, true);
 });
 function lock(value) {
  busy = value;
  openDungeons.disabled = enterTrialDungeon.disabled = backToDungeons.disabled = openPinnedTrials.disabled = value;
  for (const list of [trialList, pinnedTrialList]) {
   for (const button of list.querySelectorAll('button')) button.disabled = value;
  }
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
  openChat.disabled = chatSend.disabled = value;
  starterFight.disabled = starterNext.disabled = value;
  for (const container of [starterPlazaChoice, starterResultChoice]) {
   for (const button of container.querySelectorAll('button')) button.disabled = value;
  }
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

 async function playback(report, rewardText, holdResult = false) {
  clearTimeout(returnToSquareTimer);
  starterResultChoice.replaceChildren();
  showSquarePanel(null);
  showDailyDetails(false);
  townStage.hidden = true;
  battleView.hidden = false;
  $('arena-title').focus({preventScroll:true});
  lastReport = report;
  await playBattle({
   turns:battleTurns(report), hp:{left:report.left_hp, right:report.right_hp}, winner:report.winner,
   players:{left:report.attacker, right:report.defender}, damageTotals:damageBySource(report.events), rewardText,
  });
  if (!holdResult) returnToSquareTimer = setTimeout(returnToSquare, 3000);
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
    const move = event.source_type === 'skill' && event.source_id !== 'combo'
     ? event.source_name : `${event.source_name} · ${event.move_name}`;
    if (event.kind === 'dodge') {
     item.textContent = `使用「${move}」，被 ${defender} 闪避。`;
    } else if (event.kind === 'knockout') {
     item.textContent = `${defender} 倒下了。`;
    } else if (event.kind === 'support') {
     item.textContent = `施展「${move}」。`;
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

 function resetChat() {
  chatGeneration++;
  chatCursor = pendingChat = undefined;
  chatLoading = false;
  chatMessages.replaceChildren();
  chatForm.reset();
  chatFeedback.textContent = '';
  $('town-chat-empty').hidden = true;
 }

 async function refreshChat() {
  if (chatLoading) return;
  const generation = chatGeneration;
  chatLoading = true;
  try {
   const {messages: incoming} = await api('game', chatCursor ? `/chat/after/${chatCursor}` : '/chat');
   if (generation !== chatGeneration) return;
   const follow = chatFeed.scrollHeight - chatFeed.scrollTop - chatFeed.clientHeight < 36;
   for (const message of incoming) {
    const row = document.createElement('li');
    const meta = document.createElement('div');
    const name = document.createElement('strong');
    const time = document.createElement('time');
    const text = document.createElement('p');
    row.toggleAttribute('data-self', message.player_id === session.player.player_id);
    meta.className = 'town-chat-meta';
    name.textContent = message.name;
    time.textContent = battleDate(message, time);
    text.textContent = message.text;
    meta.append(name, time);
    row.append(meta, text);
    chatMessages.append(row);
   }
   if (incoming.length) chatCursor = incoming.at(-1).message_id;
   while (chatMessages.childElementCount > 200) chatMessages.firstElementChild.remove();
   $('town-chat-empty').hidden = Boolean(chatMessages.childElementCount);
   if (follow) chatFeed.scrollTop = chatFeed.scrollHeight;
  } finally {
   if (generation === chatGeneration) chatLoading = false;
  }
 }

 openChat.addEventListener('click', () => run(async () => {
  showSquarePanel(chatPanel, openChat, true);
  await refreshChat();
 }));
 window.setInterval(() => {
  if (!session || busy || document.hidden || chatPanel.hidden) return;
  refreshChat().catch(() => {});
 }, 3000);

 chatForm.addEventListener('submit', event => {
  event.preventDefault();
  run(async () => {
   const text = chatText.value.trim();
   if (!text || [...text].length > 200) {
    chatFeedback.textContent = messages.chat_invalid_text;
    return;
   }
   chatFeedback.textContent = '';
   if (pendingChat?.text !== text) pendingChat = {text, request_id:newRequestId()};
   try {
    await api('game', '/chat', pendingChat);
   } catch (error) {
    if (error.code === 'unauthorized') throw error;
    if (error.code && error.code !== 'unavailable') pendingChat = undefined;
    chatFeedback.textContent = messages[error.code] ?? '发送结果暂未确认，可以重试。';
    return;
   }
   pendingChat = undefined;
   if (chatText.value.trim() === text) chatText.value = '';
   await refreshChat();
   if (!chatPanel.hidden) chatText.focus({preventScroll:true});
  });
 });

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
  if (kind === 'trial') {
   const outcome = data.trial?.first_clear ? '首次通关' : data.winner === 'left' ? '获胜' : data.winner === 'draw' ? '平局' : '落败';
   return `江湖试炼 · ${data.opponent} · ${outcome}`;
  }
  if (kind === 'challenge' || kind === 'defense') {
   const side = kind === 'challenge' ? 'left' : 'right';
   const outcome = data.winner === 'draw' ? '平局' : data.winner === side ? '获胜' : '落败';
   return (kind === 'challenge' ? `挑战 ${data.opponent}` : `${data.opponent} 挑战了你`) + ` · ${outcome}`;
  }
  if (kind === 'daily_task') return '领取每日乐斗奖励';
  if (kind === 'initial_weapon') return `获得初始武器 ${weaponMoves[data.weapon_id]?.label ?? data.weapon_id}`;
  if (kind === 'starter_weapon') return `获得新手武器 ${weaponMoves[data.weapon_id]?.label ?? data.weapon_id}`;
  if (kind === 'learn_technique') return `学会招式 ${data.name}`;
  if (kind === 'purchase') return `花费 ${data.coins} 金币购买 ${itemDetails[data.item_id]?.name ?? data.item_id}`;
  if (kind === 'rename') return `将角色名从 ${data.old_name} 改为 ${data.name}`;
  if (kind === 'grant') {
   const catalog = data.kind === 'weapon' ? weaponMoves : itemDetails;
   const name = catalog[data.asset_id]?.label ?? catalog[data.asset_id]?.name ?? data.asset_id;
   return `收到 ${name}${data.quantity > 1 ? ` × ${data.quantity}` : ''}`;
  }
  return '玩家活动';
 }

 function statGrowthText(growth) {
  const label = statLabels[growth?.stat];
  return label ? `${label} +${growth.amount}` : '';
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
   details.append(label);
   const reward = entry.data.reward;
   if (reward) {
    const summary = document.createElement('span');
    const weapon = weaponMoves[reward.weapon_id]?.label ?? reward.weapon_id;
    summary.textContent = [
     `+${reward.xp} 经验`,
     reward.level_up && `升至 Lv. ${reward.level}`,
     statGrowthText(reward.stat_growth),
     weapon && `获得武器 ${weapon}`,
    ].filter(Boolean).join(' · ');
    details.append(summary);
   }
   if (!entry.data.backfilled) {
    time.textContent = battleDate(entry, time);
    details.append(time);
   }
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
  const playerId = session.player.player_id;
  const {battles} = await api('game', '/battles');
  if (session?.player.player_id !== playerId) return;
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
   if (report.can_rematch) actions.append(makeRematchButton(report, matchLabel));
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
    panel:squarePanels.find(panel => !panel.hidden) ?? null,
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
  renderCombatPower($('town-opponent-power'), progression.combat_power);
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
  renderTechniques(skills, progression.techniques);
  skills.hidden = !skills.childElementCount;
  $('town-opponent-skills-empty').hidden = !skills.hidden;
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
  starterResultChoice.replaceChildren();
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
   if (error.stamina) {
    renderStamina(error.stamina);
    const {current, challenge_cost} = error.stamina;
    error.message = `体力不足（剩余 ${current} 点，挑战需 ${challenge_cost} 点）。`;
   }
   throw error;
  }
  pending = null;
  const reward = report.reward;
  const weapon = weaponMoves[reward?.weapon_id];
  const rewardText = reward ? [
   `+${reward.xp} 经验`,
   reward.level_up && `升至 Lv. ${reward.level}`,
   statGrowthText(reward.stat_growth),
   reward.level_up && (weapon ? `获得${weapon.label}` : '武器已集齐'),
   ...((reward.techniques ?? []).map(technique => `学会${technique.name}`)),
  ].filter(Boolean).join(' · ') : report.trial?.first_clear ? `首次通关 · ${report.defender.name}` : '';
  await playback(report, rewardText, reward?.starter_ready);
  const state = await api('game', '/session');
  renderPlayer(state);
  if (reward?.starter_ready && !battleView.hidden && state.starter?.step === 'choose') {
   renderStarterChoices(starterResultChoice, state.starter, true);
  }
  await Promise.all([
   refreshHistory(),
   refreshMailCount(),
   report.trial?.first_clear && refreshTrials(),
  ]);
 }

 refreshOpponentsButton.addEventListener('click', async () => {
  if (busy) return;
  opponentsList.setAttribute('aria-busy', 'true');
  try {
   await run(refreshOpponents);
  } finally {
   opponentsList.removeAttribute('aria-busy');
  }
 });

 function setOpponentsExpanded(expanded) {
  opponentsSidebar.hidden = !expanded;
  openOpponents.hidden = expanded;
  openOpponents.setAttribute('aria-expanded', String(expanded));
  (expanded ? closeOpponents : openOpponents).focus({preventScroll:true});
 }
 openOpponents.addEventListener('click', () => setOpponentsExpanded(true));
 closeOpponents.addEventListener('click', () => setOpponentsExpanded(false));

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
