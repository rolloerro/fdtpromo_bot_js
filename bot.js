import dotenv from "dotenv";
import { Telegraf } from "telegraf";

// Загружаем токен из .env
dotenv.config();
const TOKEN = process.env.TELEGRAM_TOKEN;

if (!TOKEN) {
  throw new Error("❌ Не найден TELEGRAM_TOKEN в .env — проверь файл!");
}

const bot = new Telegraf(TOKEN);

// Команда /start
bot.start((ctx) => {
  ctx.reply("Привет! 🤖 Бот запущен и готов к работе!");
});

// Команда /help
bot.help((ctx) => {
  ctx.reply("Список команд:\n/start — запустить бота\n/help — справка");
});

// Обработка всех сообщений
bot.on("text", (ctx) => {
  ctx.reply(`Ты сказал: ${ctx.message.text}`);
});

// Запуск
bot.launch();
console.log("✅ fdtpromo_bot запущен и ждёт сообщений...");

// Грейсфул-шатдаун (чтобы красиво завершать при Ctrl+C)
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
