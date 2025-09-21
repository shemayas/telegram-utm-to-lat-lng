import TelegramBot from "node-telegram-bot-api";
import { getMapInfoByUtmText } from "../utils";

const bot = new TelegramBot(process.env.BOT_TOKEN!);

export default async function handler(request: Request) {
  if (request.method === "POST") {
    // Parse JSON manually
    const update: TelegramBot.Update = await request.json();

    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;

      const { mapUrl, latitude, longitude } = getMapInfoByUtmText(text);

      bot.sendLocation(chatId, latitude, longitude);

      bot.sendMessage(
        chatId,
        mapUrl ? `Here is the location: ${mapUrl}` : "Conversion failed.",
        { disable_web_page_preview: false }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
}
