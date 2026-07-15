const { TelegramBot } = require('node-telegram-bot-api');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;

if (TOKEN) {
  bot = new TelegramBot(TOKEN, { polling: true });

  // When a user messages the bot, reply with their chat_id so they can link it via /user/telegram
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      `Your Telegram chat ID is: ${msg.chat.id}\nPaste this into your Watchtower account settings to receive alerts.`
    );
  });
} else {
  console.warn('TELEGRAM_BOT_TOKEN not set — Telegram notifications disabled.');
}

async function sendTelegramAlert(chatId, message) {
  if (!bot) {
    console.log(`[DEV] Would send Telegram alert to ${chatId}: ${message}`);
    return;
  }
  try {
    await bot.sendMessage(chatId, message);
  } catch (err) {
    console.error('Failed to send Telegram message:', err.message);
  }
}

module.exports = { sendTelegramAlert };
