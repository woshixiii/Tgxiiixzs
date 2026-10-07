const { Telegraf, Markup } = require('telegraf');
// ==================== 🛠️ 用户配置区域（小白改这里即可） ==================== const CONFIG = { // 1. 官方频道配置 // 如果是公开频道填 '@你的频道用户名'，如果是私密频道填数字 ID 如 '-1001234567890' CHANNEL_ID: '@your_channel_username', CHANNEL_LINK: 'https://t.me/your_channel_username',
// 2. 官方群组配置 GROUP_LINK: 'https://t.me/your_group_username', // 或你的安全邀请链接
// 3. 商务合作私聊链接 ADMIN_CONTACT: 'https://t.me/your_personal_username',
// 4. 作品集配置数组（可随意增减） WORKS: [ { id: 'work_1', name: '🤖 自动发卡机器人 V1', photo: 'https://picsum.photos/800/400?random=1', // 作品图片 URL，也可置空 '' description: '【自动发卡机器人 V1】\n\n全自动卡密发放，支持多币种支付，具备高并发与极速响应特点。', link: 'https://t.me/your_demo_bot_1' }, { id: 'work_2', name: '🛡️ 社区防炸群卫士', photo: 'https://picsum.photos/800/400?random=2', description: '【社区防炸群卫士】\n\n智能识别垃圾广告、入群验证码验证、自动封禁违规账号，保障群组高粘性交流。', link: 'https://t.me/your_demo_bot_2' }, { id: 'work_3', name: '📊 自动化宣发机器人', photo: '', description: '【自动化宣发机器人】\n\n支持多频道定时同步发帖、数据监测与一键裂变营销。', link: 'https://t.me/your_demo_bot_3' } ] }; // =========================================================================
// 初始化 Bot const bot = new Telegraf(process.env.BOT_TOKEN);
// 1. 辅助函数：构造主菜单键盘 function getMainMenu() { return Markup.inlineKeyboard([ [Markup.button.callback('📁 浏览开发作品集', 'view_portfolio')], [ Markup.button.url('📢 官方频道', CONFIG.CHANNEL_LINK), Markup.button.callback('💬 交流群组', 'join_group') ], [ Markup.button.url('🤝 商务合作 / 定制开发', CONFIG.ADMIN_CONTACT), Markup.button.switchToChat('🚀 分享给好友', ' 推荐一个很棒的 Telegram 开发者机器人！') ] ]); }
// 2. 辅助函数：检查用户是否订阅频道 async function checkSubscription(ctx) { try { const member = await ctx.telegram.getChatMember(CONFIG.CHANNEL_ID, ctx.from.id); const validStatuses = ['creator', 'administrator', 'member']; return validStatuses.includes(member.status); } catch (error) { console.error('检查频道关注状态失败:', error); // 如果机器人未加入频道或配置错误，默认允许通行以防死锁，但在日志打印报错 return true; } }
// 3. /start 指令处理 bot.start((ctx) => { const welcomeText = 👋 你好，<b>${ctx.from.first_name || '朋友'}</b>！\n\n欢迎来到我的开发作品展示与服务中心。\n请点击下方菜单体验我们的服务：; return ctx.replyWithHTML(welcomeText, getMainMenu()); });
// 4. 【📁 浏览开发作品集】点击逻辑（含强关拦截） bot.action('view_portfolio', async (ctx) => { await ctx.answerCbQuery(); const isSubscribed = await checkSubscription(ctx);
if (!isSubscribed) { // 强制关注拦截提示 const forceSubText = ⚠️ <b>访问受限</b>\n\n为了防止恶意刷屏并获取最新作品更新，请先加入我们的官方频道后再点击【验证并继续】。; const forceSubMenu = Markup.inlineKeyboard([ [Markup.button.url('📢 点击加入官方频道', CONFIG.CHANNEL_LINK)], [Markup.button.callback('✅ 我已关注，验证并继续', 'view_portfolio')], [Markup.button.callback('⬅️ 返回主菜单', 'back_to_main')] ]);
// 如果是回调按钮触发，尽量编辑原消息；编辑失败则发送新消息
try {
  return await ctx.editMessageText(forceSubText, { parse_mode: 'HTML', ...forceSubMenu });
} catch (e) {
  return await ctx.replyWithHTML(forceSubText, forceSubMenu);
}
}
// 已关注，显示作品列表 return showPortfolioList(ctx); });
// 5. 显示作品列表函数 async function showPortfolioList(ctx) { let text = 📂 <b>作品集列表</b>\n\n请点击下方按钮查看具体作品详情与演示：;
const buttons = CONFIG.WORKS.map(work => [ Markup.button.callback(work.name, work_detail_${work.id}) ]); buttons.push([Markup.button.callback('⬅️ 返回主菜单', 'back_to_main')]);
const keyboard = Markup.inlineKeyboard(buttons);
try { return await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }); } catch (e) { return await ctx.replyWithHTML(text, keyboard); } }
// 6. 作品详情处理 CONFIG.WORKS.forEach(work => { bot.action(work_detail_${work.id}, async (ctx) => { await ctx.answerCbQuery();
const detailMenu = Markup.inlineKeyboard([
  work.link ? [Markup.button.url('🔗 体验演示 / 查看详情', work.link)] : [],
  [Markup.button.callback('🔙 返回作品列表', 'view_portfolio')],
  [Markup.button.callback('🏠 返回主菜单', 'back_to_main')]
].filter(row => row.length > 0));

// 如果配置了图片，则发送图片消息
if (work.photo) {
  await ctx.deleteMessage().catch(() => {});
  return ctx.replyWithPhoto(work.photo, {
    caption: work.description,
    parse_mode: 'HTML',
    ...detailMenu
  });
} else {
  // 无图片则发送文本
  try {
    return await ctx.editMessageText(work.description, { parse_mode: 'HTML', ...detailMenu });
  } catch (e) {
    return await ctx.replyWithHTML(work.description, detailMenu);
  }
}
}); });
// 7. 防炸群安全入群提示 bot.action('join_group', async (ctx) => { await ctx.answerCbQuery(); const safeText = 🛡️ <b>官方交流群安全入口</b>\n\n为防范垃圾广告机器人，群组已开启安全验证。\n请点击下方链接加入群组，并按提示完成验证：; const safeMenu = Markup.inlineKeyboard([ [Markup.button.url('👉 点击进入安全验证群组', CONFIG.GROUP_LINK)], [Markup.button.callback('⬅️ 返回主菜单', 'back_to_main')] ]);
try { return await ctx.editMessageText(safeText, { parse_mode: 'HTML', ...safeMenu }); } catch (e) { return await ctx.replyWithHTML(safeText, safeMenu); } });
// 8. 返回主菜单处理 bot.action('back_to_main', async (ctx) => { await ctx.answerCbQuery(); const welcomeText = 👋 你好，<b>${ctx.from.first_name || '朋友'}</b>！\n\n欢迎来到我的开发作品展示与服务中心。\n请点击下方菜单体验我们的服务：;
// 删除可能带图片的旧消息并重发主菜单，保证体验干净 await ctx.deleteMessage().catch(() => {}); return ctx.replyWithHTML(welcomeText, getMainMenu()); });
// 9. Vercel Webhook 导出的处理接口 (无状态 Handler) module.exports = async (req, res) => { try { if (req.method === 'POST') { await bot.handleUpdate(req.body); res.status(200).send('OK'); } else { res.status(200).send('Bot Running Successfully!'); } } catch (error) { console.error('Webhook Error:', error); res.status(200).send('Error'); } };
