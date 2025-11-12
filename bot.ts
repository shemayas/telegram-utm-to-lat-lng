import TelegramBot, { Message } from "node-telegram-bot-api";
import dotenv from "dotenv";
import { getMapInfoByUtmText } from "./utils";

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("Missing BOT_TOKEN in .env");
}

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg: Message) => {
  const chatId = msg.chat.id;

  try {
    const text = msg.text?.trim();
    if (!text) throw new Error();

    const { mapUrl, latitude, longitude } = getMapInfoByUtmText(text);

    bot.sendLocation(chatId, latitude, longitude);

    bot.sendMessage(
      chatId,
      mapUrl ? `Here is the location: ${mapUrl}` : "Conversion failed.",
      { disable_web_page_preview: false }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    bot.sendMessage(chatId, msg || "Please send valid UTM coordinates.");
  }
});
