const { Telegraf, Markup } = require('telegraf');

// ==================== 🔑 1. 机器人密钥配置 ====================
const BOT_TOKEN = process.env.BOT_TOKEN || '8981810303:AAHqqMaWhPhR9a98ZqbaEvcPKGGgu2ixdiY';

// ==================== 🛠️ 2. 用户业务配置 ====================
const CONFIG = {
  // 👑 导师/管理员的 Telegram 数字 ID（用于接收和回复客户私聊）
  // 在 TG 找 @userinfobot 发消息即可查到你的数字 ID
  ADMIN_CHAT_ID: 7822042164, // 👈 换成你的真实数字 ID（注意不要带引号）

  // 📢 官方频道配置
  CHANNEL_ID: '@xiiixpd', 
  CHANNEL_LINK: 'https://t.me/xiiixpd',

  // 💬 官方群组配置
  GROUP_LINK: 'https://t.me/xiiixqz',

  // 🤝 商务合作链接（单向客户引导）
  // 填写你的个人私聊链接（如果客户不是单向可直连）
  ADMIN_CONTACT: 'https://t.me/idxiii',

  // 📁 作品集展示列表
  WORKS: [
    {
      id: 'work_card_1',
      name: '🤖 自动发卡机器人 V1.0',
      photo: 'https://picsum.photos/800/400?random=1',
      description: `<b>💎 【全自动发卡机器人 V1.0】</b>\n\n` +
                   `━━━━━ <b>作品亮点</b> ━━━━━\n` +
                   `⚡️ <b>极速响应</b>：毫秒级回调\n` +
                   `💰 <b>多币种支持</b>：支持 USDT / TRX\n\n` +
                   `👇 <i>点击下方按钮体验实时演示：</i>`,
      link: 'https://t.me/your_demo_bot_1'
    },
    {
      id: 'work_card_2',
      name: '🛡️ 社区防炸群卫士',
      photo: 'https://picsum.photos/800/400?random=2',
      description: `<b>🛡️ 【社区防炸群卫士系统】</b>\n\n` +
                   `━━━━━ <b>核心功能</b> ━━━━━\n` +
                   `🤖 <b>智能验人</b>：入群九宫格验证\n\n` +
                   `👇 <i>点击下方按钮体验实时演示：</i>`,
      link: 'https://t.me/your_demo_bot_2'
    }
  ]
};

// ==================== 🚀 3. 机器人核心逻辑 ====================
const bot = new Telegraf(BOT_TOKEN);

function buildMainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📁 浏览开发作品集 (Portfolio)', 'btn_portfolio')],
    [
      Markup.button.url('📢 官方频道', CONFIG.CHANNEL_LINK),
      Markup.button.callback('💬 交流社区 (防炸)', 'btn_group')
    ],
    [
      Markup.button.callback('🤝 商务合作 / 导师私聊 (破单向限制)', 'btn_contact_admin'),
      Markup.button.switchToChat('🚀 分享给好友', ' 推荐一个很棒的 TelegramBot 开发者！')
    ]
  ]);
}

async function checkChannelSub(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CONFIG.CHANNEL_ID, ctx.from.id);
    return ['creator', 'administrator', 'member'].includes(member.status);
  } catch (error) {
    return true; 
  }
}

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
                   `如需商务合作或私聊，可直接在当前对话框给发消息留言！\n\n` +
                   `👇 <b>请点击下方菜单开启体验：</b>`;
  return sendVisualCard(ctx, startMsg, buildMainMenu());
});

// 2️⃣ 点击【商务合作 / 导师私聊】提示
bot.action('btn_contact_admin', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const contactMsg = `🤝 <b>商务合作与沟通通道</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `💡 <b>双向/单向限制用户均可沟通：</b>\n\n` +
                     `1️⃣ <b>直接私聊导师</b>：<a href="${CONFIG.ADMIN_CONTACT}">点击此处发起个人私聊</a>\n` +
                     `2️⃣ <b>单向限制账号留言</b>：如果您是单向账号无法私聊，请<b>直接在此对话框中发送您的需求文字或图片</b>，导师会收到通知并直接回复您！`;
  const contactMenu = Markup.inlineKeyboard([
    [Markup.button.url('👤 试试直接私聊导师', CONFIG.ADMIN_CONTACT)],
    [Markup.button.callback('⬅️ 返回主菜单', 'btn_main')]
  ]);
  return sendVisualCard(ctx, contactMsg, contactMenu);
});

// 3️⃣ 点击【📁 浏览开发作品集】
bot.action('btn_portfolio', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const isSubbed = await checkChannelSub(ctx);

  if (!isSubbed) {
    const blockMsg = `🔒 <b>访问受限：需要完成验证</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `⚠️ 请先加入我们的<b>【官方频道】</b>后再点击下方验证按钮解锁作品集！`;
    const blockMenu = Markup.inlineKeyboard([
      [Markup.button.url('📢 第一步：点击加入官方频道', CONFIG.CHANNEL_LINK)],
      [Markup.button.callback('✅ 第二步：我已加入，解锁作品集', 'btn_portfolio')],
      [Markup.button.callback('⬅️ 返回主菜单', 'btn_main')]
    ]);
    return sendVisualCard(ctx, blockMsg, blockMenu);
  }

  let portfolioMsg = `📂 <b>精选作品集列表</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `请点击下方对应的作品卡片查看详情：`;
  const workButtons = CONFIG.WORKS.map(work => [
    Markup.button.callback(work.name, `show_work_${work.id}`)
  ]);
  workButtons.push([Markup.button.callback('⬅️ 返回主菜单', 'btn_main')]);

  return sendVisualCard(ctx, portfolioMsg, Markup.inlineKeyboard(workButtons));
});

// 4️⃣ 统一回调处理
bot.on('callback_query', async (ctx) => {
  const actionData = ctx.callbackQuery.data;
  await ctx.answerCbQuery().catch(() => {});

  if (actionData === 'btn_main') {
    const userName = ctx.from.first_name || '尊贵的访客';
    const startMsg = `✨ <b>欢迎光临开发作品展示中心！</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `👋 你好，<b>${userName}</b>！\n\n` +
                     `请点击下方菜单开启体验：`;
    return sendVisualCard(ctx, startMsg, buildMainMenu());
  }

  if (actionData === 'btn_group') {
    const groupMsg = `🛡️ <b>官方交流社区 - 安全防炸群通道</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `请点击下方专属安全验证链接加入交流群：`;
    const groupMenu = Markup.inlineKeyboard([
      [Markup.button.url('👉 点击进入官方验证社区', CONFIG.GROUP_LINK)],
      [Markup.button.callback('⬅️ 返回主菜单', 'btn_main')]
    ]);
    return sendVisualCard(ctx, groupMsg, groupMenu);
  }

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

// 5️⃣ 📩 客服核心功能：转发普通用户的私聊留言给导师
bot.on('message', async (ctx) => {
  // 如果消息来自管理员本人
  if (ctx.from.id === Number(CONFIG.ADMIN_CHAT_ID)) {
    // 检查管理员是不是正在“回复”某条被转发的消息
    if (ctx.message.reply_to_message && ctx.message.reply_to_message.forward_from) {
      const targetUserId = ctx.message.reply_to_message.forward_from.id;
      try {
        // 把管理员的回复复制还给客户
        await ctx.telegram.copyMessage(targetUserId, ctx.chat.id, ctx.message.message_id);
        return ctx.reply('✅ 你的回复已成功送达给客户！');
      } catch (err) {
        return ctx.reply(`❌ 回复失败，可能客户已关停机器人。错误信息: ${err.message}`);
      }
    }
    return; // 如果不是回复操作，管理员日常消息不处理
  }

  // 如果消息来自普通客户：转发该消息给管理员
  try {
    // 告知客户消息已收到
    await ctx.reply('📩 <b>您的留言已成功传达给导师！</b>\n导师将在看到后第一时间在此回复您，请留意系统通知。', { parse_mode: 'HTML' });

    // 转发给导师
    await ctx.telegram.forwardMessage(CONFIG.ADMIN_CHAT_ID, ctx.chat.id, ctx.message.message_id);
  } catch (error) {
    console.error('转发留言失败:', error);
  }
});

// 6️⃣ 网页健康检查服务器与启动
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Service Running!\n');
}).listen(PORT, () => console.log(`Server listening on port ${PORT}`));

bot.launch().then(() => console.log('✅ Telegram 机器人与客服中转系统已成功拉起！'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// 简单 HTTP 监听，防止 Render Web Service 健康检查报错 const http = require('http'); const PORT = process.env.PORT || 3000; http.createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('Bot is running alive!\n'); }).listen(PORT, () => { console.log(HTTP Health Check Server listening on port ${PORT}); });
