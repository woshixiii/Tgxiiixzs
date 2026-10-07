const { Telegraf, Markup } = require('telegraf');

// ==================== 🔑 1. 机器人密钥配置 ====================
// 从 Telegram 的 @BotFather 复制出来的 Token 贴在这里：
const BOT_TOKEN = process.env.BOT_TOKEN || '8981810303:AAHqqMaWhPhR9a98ZqbaEvcPKGGgu2ixdiY';

// ==================== 🛠️ 2. 用户业务配置（可随时像修改记事本一样修改） ====================
const CONFIG = {
  // 📢 官方频道配置
  // 公开频道填 '@你的频道用户名'，私密频道填数字 ID 如 '-1001234567890'
  CHANNEL_ID: '@xiiixpd', 
  CHANNEL_LINK: 'https://t.me/xiiixpd',

  // 💬 官方群组配置（防炸群安全入口）
  GROUP_LINK: 'https://t.me/xiiixqz',

  // 🤝 商务合作个人 Telegram 私聊链接
  ADMIN_CONTACT: 'https://t.me/idxiii',

  // 📁 作品集展示列表（精美卡片模式）
  WORKS: [
    {
      id: 'work_card_1',
      name: '🤖 自动发卡机器人 V1.0',
      photo: 'https://picsum.photos/800/400?random=1', // 作品海报图/截图，没有可留空 ''
      description: `<b>💎 【全自动发卡机器人 V1.0】</b>\n\n` +
                   `━━━━━ <b>作品亮点</b> ━━━━━\n` +
                   `⚡️ <b>极速响应</b>：基于高并发无缝架构，毫秒级回调\n` +
                   `💰 <b>多币种支持</b>：支持 USDT / TRX / 自动发卡\n` +
                   `🛡️ <b>安全防风控</b>：数据全加密存储，完美隔绝风险\n\n` +
                   `👇 <i>点击下方按钮体验实时演示：</i>`,
      link: 'https://t.me/your_demo_bot_1'
    },
    {
      id: 'work_card_2',
      name: '🛡️ 社区防炸群卫士',
      photo: 'https://picsum.photos/800/400?random=2',
      description: `<b>🛡️ 【社区防炸群卫士系统】</b>\n\n` +
                   `━━━━━ <b>核心功能</b> ━━━━━\n` +
                   `🤖 <b>智能验人</b>：入群九宫格验证，精准拦截清屏刷屏黑产\n` +
                   `🎯 <b>广告清理</b>：秒识别违规关键词与加密黑产链接\n` +
                   `📊 <b>数据监控</b>：高粘性技术社区的最佳护航利器\n\n` +
                   `👇 <i>点击下方按钮体验实时演示：</i>`,
      link: 'https://t.me/your_demo_bot_2'
    },
    {
      id: 'work_card_3',
      name: '📊 全自动多频道宣发矩阵',
      photo: '',
      description: `<b>🚀 【全自动多频道宣发矩阵机器人】</b>\n\n` +
                   `━━━━━ <b>核心功能</b> ━━━━━\n` +
                   `📡 <b>多台同步</b>：支持一键将广告/日志同步至几十个频道与群组\n` +
                   `📈 <b>裂变追踪</b>：自带邀请奖励与流量分析报表\n\n` +
                   `👇 <i>点击下方按钮联系定制开发：</i>`,
      link: 'https://t.me/your_personal_username'
    }
  ]
};

// ==================== 🚀 3. 机器人核心逻辑（无需修改） ====================
const bot = new Telegraf(BOT_TOKEN);

// 🎨 常用主菜单按钮模板
function buildMainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📁 浏览开发作品集 (Portfolio)', 'btn_portfolio')],
    [
      Markup.button.url('📢 官方频道', CONFIG.CHANNEL_LINK),
      Markup.button.callback('💬 交流社区 (防炸)', 'btn_group')
    ],
    [
      Markup.button.url('🤝 商务定制 / 私聊导师', CONFIG.ADMIN_CONTACT),
      Markup.button.switchToChat('🚀 分享给好友', ' 推荐一个非常优秀的 TelegramBot 开发者系统！')
    ]
  ]);
}

// 🛡️ 强制关注频道检测
async function checkChannelSub(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CONFIG.CHANNEL_ID, ctx.from.id);
    return ['creator', 'administrator', 'member'].includes(member.status);
  } catch (error) {
    console.warn('⚠️ [频道检测提示] 机器人未接入频道或权限不足，默认放行，错误日志:', error.message);
    return true; 
  }
}

// 🖼️ 通用消息安全清空重发器（防止图文混排编辑报错）
async function sendVisualCard(ctx, text, keyboard, photoUrl = '') {
  await ctx.deleteMessage().catch(() => {});
  if (photoUrl && photoUrl.trim() !== '') {
    return ctx.replyWithPhoto(photoUrl, {
      caption: text,
      parse_mode: 'HTML',
      ...keyboard
    });
  } else {
    return ctx.replyWithHTML(text, keyboard);
  }
}

// 1️⃣ /start 指令处理
bot.start((ctx) => {
  const userName = ctx.from.first_name || '尊贵的访客';
  const startMsg = `✨ <b>欢迎光临开发作品展示中心！</b>\n` +
                   `━━━━━━━━━━━━━━━━━━━\n` +
                   `👋 你好，<b>${userName}</b>！\n\n` +
                   `我是您的 24 小时全自动宣发与作品展示助手。\n` +
                   `在这里您可以体验最新的 Telegram 机器人定制案例与技术方案。\n\n` +
                   `👇 <b>请点击下方菜单开启体验：</b>`;
  return sendVisualCard(ctx, startMsg, buildMainMenu());
});

// 2️⃣ 点击【📁 浏览开发作品集】逻辑（强关拦截）
bot.action('btn_portfolio', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const isSubbed = await checkChannelSub(ctx);

  if (!isSubbed) {
    const blockMsg = `🔒 <b>访问受限：需要完成验证</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `⚠️ 为了防止恶意刷屏并获取最新作品日志：\n` +
                     `请先加入我们的<b>【官方频道】</b>后再点击下方验证按钮解锁作品集！`;
    const blockMenu = Markup.inlineKeyboard([
      [Markup.button.url('📢 第一步：点击加入官方频道', CONFIG.CHANNEL_LINK)],
      [Markup.button.callback('✅ 第二步：我已加入，解锁作品集', 'btn_portfolio')],
      [Markup.button.callback('⬅️ 返回主菜单', 'btn_main')]
    ]);
    return sendVisualCard(ctx, blockMsg, blockMenu);
  }

  // 放行，显示作品列表
  let portfolioMsg = `📂 <b>精选作品集列表</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `请点击下方对应的作品卡片，体验演示效果与查看架构解析：`;
  const workButtons = CONFIG.WORKS.map(work => [
    Markup.button.callback(work.name, `show_work_${work.id}`)
  ]);
  workButtons.push([Markup.button.callback('⬅️ 返回主菜单', 'btn_main')]);

  return sendVisualCard(ctx, portfolioMsg, Markup.inlineKeyboard(workButtons));
});

// 3️⃣ 统一回调处理（主菜单、防炸群入口、作品卡片）
bot.on('callback_query', async (ctx) => {
  const actionData = ctx.callbackQuery.data;
  await ctx.answerCbQuery().catch(() => {});

  // 返回主菜单
  if (actionData === 'btn_main') {
    const userName = ctx.from.first_name || '尊贵的访客';
    const startMsg = `✨ <b>欢迎光临开发作品展示中心！</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `👋 你好，<b>${userName}</b>！\n\n` +
                     `请点击下方菜单开启体验：`;
    return sendVisualCard(ctx, startMsg, buildMainMenu());
  }

  // 防炸群安全入口提示
  if (actionData === 'btn_group') {
    const groupMsg = `🛡️ <b>官方交流社区 - 安全防炸群通道</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `为防范垃圾广告机器人袭群，社区已启用专属安全拦截机制。\n` +
                     `请点击下方专属安全验证链接加入交流群：`;
    const groupMenu = Markup.inlineKeyboard([
      [Markup.button.url('👉 点击进入官方验证社区', CONFIG.GROUP_LINK)],
      [Markup.button.callback('⬅️ 返回主菜单', 'btn_main')]
    ]);
    return sendVisualCard(ctx, groupMsg, groupMenu);
  }

  // 渲染单项作品详情卡片
  if (actionData.startsWith('show_work_')) {
    const workId = actionData.replace('show_work_', '');
    const work = CONFIG.WORKS.find(w => w.id === workId);

    if (work) {
      const cardMenu = Markup.inlineKeyboard([
        work.link ? [Markup.button.url('🔗 体验实时演示 / 查看详情', work.link)] : [],
        [Markup.button.callback('🔙 返回作品列表', 'btn_portfolio')],
        [Markup.button.callback('🏠 返回主菜单', 'btn_main')]
      ].filter(row => row.length > 0));

      return sendVisualCard(ctx, work.description, cardMenu, work.photo);
    }
  }
});

// 4️⃣ 启动轮询（无需域名，启动即监听）
bot.launch().then(() => {
  console.log('✅ [系统通知] Telegram 机器人已成功拉起，正在运行轮询监听中...');
}).catch((err) => {
  console.error('❌ [启动失败] 请检查 BOT_TOKEN 是否正确:', err);
});

// 优雅终止机制
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
