const { Telegraf, Markup } = require('telegraf');

// ==================== 🔑 1. 机器人密钥与配置（自动填写） ====================
const BOT_TOKEN = process.env.BOT_TOKEN || '8981810303:AAHqqMaWhPhR9a98ZqbaEvcPKGGgu2ixdiY';

const CONFIG = {
  // 👑 作者的 Telegram 数字 ID
  ADMIN_CHAT_ID: 7822042164,

  // 🖼️ 欢迎小卡片的高清科技风格海报
  WELCOME_PHOTO: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',

  // 📢 官方频道配置
  CHANNEL_ID: '@xiiixpd', 
  CHANNEL_LINK: 'https://t.me/xiiixpd',

  // 💬 官方群组配置
  GROUP_LINK: 'https://t.me/xiiixqz',

  // 🤝 商务合作私聊链接
  ADMIN_CONTACT: 'https://t.me/idxiii',

  // 📁 作品集展示列表
  WORKS: [
    {
      id: 'work_card_1',
      name: '🤖 自动发卡机器人 V1.0',
      photo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      description: `<b>💎 【全自动发卡机器人 V1.0】</b>\n\n` +
                   `━━━━━ <b>作品亮点</b> ━━━━━\n` +
                   `⚡️ <b>极速响应</b>：毫秒级回调\n` +
                   `💰 <b>多币种支持</b>：支持 USDT / TRX\n\n` +
                   `👇 <i>点击下方按钮体验实时演示：</i>`,
      link: 'https://t.me/xiiixpd'
    },
    {
      id: 'work_card_2',
      name: '🛡️ 社区防炸群卫士',
      photo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      description: `<b>🛡️ 【社区防炸群卫士系统】</b>\n\n` +
                   `━━━━━ <b>核心功能</b> ━━━━━\n` +
                   `🤖 <b>智能验人</b>：入群九宫格验证，精准拦截清屏刷屏黑产\n\n` +
                   `👇 <i>点击下方按钮体验实时演示：</i>`,
      link: 'https://t.me/xiiixqz'
    }
  ]
};

// ==================== 🚀 2. 机器人核心逻辑 ====================
const bot = new Telegraf(BOT_TOKEN);

// 📱 定义【常驻底部键盘】
function getPermanentKeyboard() {
  return Markup.keyboard([
    ['📁 浏览作品集', '🤝 商务合作 / 私聊'],
    ['📢 官方频道', '💬 交流社区 (防炸)'],
    ['🏠 返回主菜单']
  ]).resize();
}

// 检查频道关注状态
async function checkChannelSub(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CONFIG.CHANNEL_ID, ctx.from.id);
    return ['creator', 'administrator', 'member'].includes(member.status);
  } catch (error) {
    return true; 
  }
}

// 🎨 渲染精美欢迎小卡片
async function sendWelcomeCard(ctx) {
  const userName = ctx.from.first_name || '尊贵的访客';
  
  // 排版精美欢迎文案
  const welcomeCaption = `✨ <b> WELCOME TO MY STUDIO </b> ✨\n` +
                         `━━━━━━━━━━━━━━━━━━━\n` +
                         `👋 <b>你好，${userName}！</b>\n\n` +
                         `我是作者的 24 小时全自动宣发与作品展示助手。\n` +
                         `专注于 Telegram 生态机器人、极速交互与自动化定制服务。\n\n` +
                         `💡 <b>小提示：</b>\n` +
                         `如需商务合作或联系作者，直接在此对话框中<b>发送消息</b>即可！\n` +
                         `━━━━━━━━━━━━━━━━━━━\n` +
                         `👇 <b>请使用下方键盘自由导航体验：</b>`;

  // 先发送底部的常驻键盘
  await ctx.reply('🚀 正在载入主菜单...', getPermanentKeyboard()).catch(() => {});

  // 发送精美科技海报小卡片
  if (CONFIG.WELCOME_PHOTO && CONFIG.WELCOME_PHOTO.trim() !== '') {
    return ctx.replyWithPhoto(CONFIG.WELCOME_PHOTO, {
      caption: welcomeCaption,
      parse_mode: 'HTML'
    });
  } else {
    return ctx.replyWithHTML(welcomeCaption);
  }
}

// 1️⃣ /start 指令处理
bot.start((ctx) => sendWelcomeCard(ctx));

// 2️⃣ 监听【常驻底部键盘】按钮点击
bot.hears('🏠 返回主菜单', (ctx) => sendWelcomeCard(ctx));

bot.hears('📁 浏览作品集', async (ctx) => {
  const isSubbed = await checkChannelSub(ctx);

  if (!isSubbed) {
    const blockMsg = `🔒 <b>访问受限：需要完成验证</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `⚠️ 请先加入我们的<b>【官方频道】</b>后再点击解锁作品集！`;
    const blockMenu = Markup.inlineKeyboard([
      [Markup.button.url('📢 点击加入官方频道', CONFIG.CHANNEL_LINK)],
      [Markup.button.callback('✅ 我已加入，点此解锁', 'btn_portfolio_check')]
    ]);
    return ctx.replyWithHTML(blockMsg, blockMenu);
  }

  let portfolioMsg = `📂 <b>精选作品集列表</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `请点击下方对应的作品查看详情：`;
  const workButtons = CONFIG.WORKS.map(work => [
    Markup.button.callback(work.name, `show_work_${work.id}`)
  ]);

  return ctx.replyWithHTML(portfolioMsg, Markup.inlineKeyboard(workButtons));
});

bot.hears('🤝 商务合作 / 私聊', (ctx) => {
  const contactMsg = `🤝 <b>商务合作与沟通通道</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━\n` +
                     `💡 <b>双向/单向限制用户均可沟通：</b>\n\n` +
                     `1️⃣ <b>直接私聊作者</b>：<a href="${CONFIG.ADMIN_CONTACT}">点击此处发起个人私聊</a>\n` +
                     `2️⃣ <b>单向限制账号留言</b>：如果您是单向账号无法私聊，请<b>直接在此对话框中发送您的需求文字或图片</b>，作者会收到通知并直接回复您！`;
  const contactMenu = Markup.inlineKeyboard([
    [Markup.button.url('👤 点击直接私聊作者', CONFIG.ADMIN_CONTACT)]
  ]);
  return ctx.replyWithHTML(contactMsg, contactMenu);
});

bot.hears('📢 官方频道', (ctx) => {
  return ctx.replyWithHTML(`📢 <b>官方频道入口：</b>\n${CONFIG.CHANNEL_LINK}`);
});

bot.hears('💬 交流社区 (防炸)', (ctx) => {
  const groupMsg = `🛡️ <b>官方交流社区 - 安全防炸群通道</b>\n` +
                   `━━━━━━━━━━━━━━━━━━━\n` +
                   `请点击下方专属安全验证链接加入交流群：`;
  const groupMenu = Markup.inlineKeyboard([
    [Markup.button.url('👉 点击进入官方验证社区', CONFIG.GROUP_LINK)]
  ]);
  return ctx.replyWithHTML(groupMsg, groupMenu);
});

// 3️⃣ 处理内嵌按钮点击
bot.action('btn_portfolio_check', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const isSubbed = await checkChannelSub(ctx);
  if (!isSubbed) {
    return ctx.reply('⚠️ 您尚未加入官方频道，请加入后再试！');
  }
  let portfolioMsg = `📂 <b>精选作品集列表</b>\n━━━━━━━━━━━━━━━━━━━\n请点击下方对应的作品查看详情：`;
  const workButtons = CONFIG.WORKS.map(work => [
    Markup.button.callback(work.name, `show_work_${work.id}`)
  ]);
  return ctx.replyWithHTML(portfolioMsg, Markup.inlineKeyboard(workButtons));
});

bot.action(/show_work_(.+)/, async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const workId = ctx.match[1];
  const work = CONFIG.WORKS.find(w => w.id === workId);

  if (work) {
    const cardMenu = Markup.inlineKeyboard([
      work.link ? [Markup.button.url('🔗 体验实时演示 / 查看详情', work.link)] : []
    ].filter(row => row.length > 0));

    if (work.photo && work.photo.trim() !== '') {
      return ctx.replyWithPhoto(work.photo, {
        caption: work.description,
        parse_mode: 'HTML',
        ...cardMenu
      });
    } else {
      return ctx.replyWithHTML(work.description, cardMenu);
    }
  }
});

// 4️⃣ 📩 双向客服功能：中转私聊消息
bot.on('message', async (ctx) => {
  const text = ctx.message.text;
  if (['🏠 返回主菜单', '📁 浏览作品集', '🤝 商务合作 / 私聊', '📢 官方频道', '💬 交流社区 (防炸)'].includes(text)) {
    return;
  }

  // 作者本人回复逻辑
  if (ctx.from.id === Number(CONFIG.ADMIN_CHAT_ID)) {
    if (ctx.message.reply_to_message && ctx.message.reply_to_message.forward_from) {
      const targetUserId = ctx.message.reply_to_message.forward_from.id;
      try {
        await ctx.telegram.copyMessage(targetUserId, ctx.chat.id, ctx.message.message_id);
        return ctx.reply('✅ 你的回复已成功送达给客户！');
      } catch (err) {
        return ctx.reply(`❌ 回复失败，可能客户已关停机器人。错误: ${err.message}`);
      }
    }
    return;
  }

  // 普通客户留言转发给作者
  try {
    await ctx.reply('📩 <b>您的留言已成功传达给作者！</b>\n作者将在看到后第一时间在此回复您，请留意系统通知。', { parse_mode: 'HTML' });
    await ctx.telegram.forwardMessage(CONFIG.ADMIN_CHAT_ID, ctx.chat.id, ctx.message.message_id);
  } catch (error) {
    console.error('转发留言失败:', error);
  }
});

// 5️⃣ 网页健康检查与服务启动
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot Service Running!\n');
}).listen(PORT, () => console.log(`Server listening on port ${PORT}`));

bot.launch().then(() => console.log('✅ Telegram 机器人已成功启动！'));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
