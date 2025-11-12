import { Telegraf } from "telegraf";
import fs from "fs";
import path from "path";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import dotenv from "dotenv";

dotenv.config(); // ← загружаем .env

const BOT_TOKEN = process.env.TELEGRAM_TOKEN;

if (!BOT_TOKEN) {
  console.error("❌ Не найден TELEGRAM_TOKEN в .env — проверь файл!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const pdfPath = path.resolve("./docs/001_onco.pdf");

// ====================== PDF ======================
async function parsePDF(filePath) {
  console.log(`📄 Загружаем PDF: ${filePath}`);
  const data = new Uint8Array(fs.readFileSync(filePath));

  const loadingTask = pdfjsLib.getDocument({
    data,
    standardFontDataUrl: "node_modules/pdfjs-dist/standard_fonts/",
  });

  const pdf = await loadingTask.promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((it) => it.str).join(" ");
    text += pageText + "\n";
  }

  console.log(`✅ PDF успешно прочитан: ${pdf.numPages} страниц`);
  return text;
}

let pdfText = "";

try {
  pdfText = await parsePDF(pdfPath);
  console.log(`✅ PDF успешно загружен. Длина текста: ${pdfText.length} символов`);
} catch (err) {
  console.error("❌ Ошибка чтения PDF:", err);
}

// ====================== TELEGRAM ======================
bot.start((ctx) =>
  ctx.reply("Привет! Я бот для поиска по PDF. Напиши запрос 🔍")
);

bot.on("text", async (ctx) => {
  const query = ctx.message.text.toLowerCase();
  console.log(`🔍 Запрос: ${query}`);

  const results = pdfText
    .split("\n")
    .filter((line) => line.toLowerCase().includes(query))
    .slice(0, 5);

  if (results.length === 0) {
    await ctx.reply("Ничего не найдено 😕");
  } else {
    await ctx.reply("🔎 Нашлось:\n\n" + results.join("\n\n"));
  }
});

bot.launch();
console.log("✅ fdtpromo_bot запущен и ждёт сообщений...");
