const { Telegraf, Markup } = require('telegraf');

// ==================== 🛠️ 用户配置区域（只修改单引号 ' ' 里的内容） ====================
const CONFIG = {
  // 1. 官方频道配置
  // 如果是公开频道填 '@你的频道用户名'，如果是私密频道填数字 ID 如 'xiiixpd'
  CHANNEL_ID: '@xiiixpd', 
  CHANNEL_LINK: 'https://t.me/xiiixpd',

  // 2. 官方群组配置
  GROUP_LINK: 'https://t.me/xiiixqz', // 或你的安全邀请链接

  // 3. 商务合作私聊链接
  ADMIN_CONTACT: 'https://t.me/idxiii',

  // 4. 作品集配置数组（可随意增减）
  WORKS: [
    {
      id: 'work_1',
      name: '🤖 自动发卡机器人 V1',
      photo: 'https://picsum.photos/800/400?random=1', // 作品图片 URL，没有可填 ''
      description: '<b>【自动发卡机器人 V1】</b>\n\n全自动卡密发放，支持多币种支付，具备高并发与极速响应特点。',
      link: 'https://t.me/your_demo_bot_1'
    },
    {
      id: 'work_2',
      name: '🛡️ 社区防炸群卫士',
      photo: 'https://picsum.photos/800/400?random=2',
      description: '<b>【社区防炸群卫士】</b>\n\n智能识别垃圾广告、入群验证码验证、自动封禁违规账号，保障群组高粘性交流。',
      link: 'https://t.me/your_demo_bot_2'
    },
    {
      id: 'work_3',
      name: '📊 自动化宣发机器人',
      photo: '',
      description: '<b>【自动化宣发机器人】</b>\n\n支持多频道定时同步发帖、数据监测与一键裂变营销。',
      link: 'https://t.me/your_demo_bot_3'
    }
  ]
};
// =========================================================================

// 初始化 Bot（每次请求时懒加载实例，适应 Serverless 环境）
const bot = new Telegraf(process.env.BOT_TOKEN);

// 1. 构造主菜单键盘
function getMainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📁 浏览开发作品集', 'view_portfolio')],
    [
      Markup.button.url('📢 官方频道', CONFIG.CHANNEL_LINK),
      Markup.button.callback('💬 交流群组', 'join_group')
    ],
    [
      Markup.button.url('🤝 商务合作 / 定制开发', CONFIG.ADMIN_CONTACT),
      Markup.button.switchToChat('🚀 分享给好友', ' 推荐一个很棒的 Telegram 开发者机器人！')
    ]
  ]);
}

// 2. 检查用户是否已关注频道
async function checkSubscription(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CONFIG.CHANNEL_ID, ctx.from.id);
    const validStatuses = ['creator', 'administrator', 'member'];
    return validStatuses.includes(member.status);
  } catch (error) {
    console.error('检查频道关注状态失败:', error);
    // 如果机器人未加频道或配置错误，避免死锁，默认放行
    return true; 
  }
}

// 3. 安全发送或更新消息（兼容图片和文本的替换）
async function sendOrUpdateMessage(ctx, text, extra, isPhoto = false, photoUrl = '') {
  try {
    // 尝试直接删除原消息再重发，彻底解决图文转换报错
    await ctx.deleteMessage().catch(() => {});
  } catch (e) {}

  if (isPhoto && photoUrl) {
    return ctx.replyWithPhoto(photoUrl, {
      caption: text,
      parse_mode: 'HTML',
      ...extra
    });
  } else {
    return ctx.replyWithHTML(text, extra);
  }
}

// 4. /start 指令
bot.start((ctx) => {
  const welcomeText = `👋 你好，<b>${ctx.from.first_name || '朋友'}</b>！\n\n欢迎来到我的开发作品展示与服务中心。\n请点击下方菜单体验我们的服务：`;
  return sendOrUpdateMessage(ctx, welcomeText, getMainMenu());
});

// 5. 【📁 浏览开发作品集】逻辑（强关拦截）
bot.action('view_portfolio', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const isSubscribed = await checkSubscription(ctx);

  if (!isSubscribed) {
    const forceSubText = `⚠️ <b>访问受限</b>\n\n为了防止恶意刷屏并获取最新作品更新，请先加入我们的官方频道后再点击【验证并继续】。`;
    const forceSubMenu = Markup.inlineKeyboard([
      [Markup.button.url('📢 点击加入官方频道', CONFIG.CHANNEL_LINK)],
      [Markup.button.callback('✅ 我已关注，验证并继续', 'view_portfolio')],
      [Markup.button.callback('⬅️ 返回主菜单', 'back_to_main')]
    ]);
    return sendOrUpdateMessage(ctx, forceSubText, forceSubMenu);
  }

  // 已关注，显示作品列表
  let listText = `📂 <b>作品集列表</b>\n\n请点击下方按钮查看具体作品详情与演示：`;
  const buttons = CONFIG.WORKS.map(work => [
    Markup.button.callback(work.name, `work_detail_${work.id}`)
  ]);
  buttons.push([Markup.button.callback('⬅️ 返回主菜单', 'back_to_main')]);

  return sendOrUpdateMessage(ctx, listText, Markup.inlineKeyboard(buttons));
});

// 6. 统一动态处理作品详情、群组与主菜单回调
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;
  await ctx.answerCbQuery().catch(() => {});

  if (data === 'back_to_main') {
    const welcomeText = `👋 你好，<b>${ctx.from.first_name || '朋友'}</b>！\n\n欢迎来到我的开发作品展示与服务中心。\n请点击下方菜单体验我们的服务：`;
    return sendOrUpdateMessage(ctx, welcomeText, getMainMenu());
  }

  if (data === 'join_group') {
    const safeText = `🛡️ <b>官方交流群安全入口</b>\n\n为防范垃圾广告机器人，群组已开启安全验证。\n请点击下方链接加入群组，并按提示完成验证：`;
    const safeMenu = Markup.inlineKeyboard([
      [Markup.button.url('👉 点击进入安全验证群组', CONFIG.GROUP_LINK)],
      [Markup.button.callback('⬅️ 返回主菜单', 'back_to_main')]
    ]);
    return sendOrUpdateMessage(ctx, safeText, safeMenu);
  }

  if (data.startsWith('work_detail_')) {
    const workId = data.replace('work_detail_', '');
    const work = CONFIG.WORKS.find(w => w.id === workId);

    if (work) {
      const detailMenu = Markup.inlineKeyboard([
        work.link ? [Markup.button.url('🔗 体验演示 / 查看详情', work.link)] : [],
        [Markup.button.callback('🔙 返回作品列表', 'view_portfolio')],
        [Markup.button.callback('🏠 返回主菜单', 'back_to_main')]
      ].filter(row => row.length > 0));

      return sendOrUpdateMessage(
        ctx, 
        work.description, 
        detailMenu, 
        Boolean(work.photo), 
        work.photo
      );
    }
  }
});

// 7. Vercel Serverless 导出的标准 Webhook 处理器
module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      await bot.handleUpdate(body);
      res.status(200).json({ ok: true });
    } else {
      res.status(200).send('Bot Serverless Endpoint Running!');
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: error.message });
  }
};
