import type { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { getMapInfoByUtmText } from "./utils";

const BOT_TOKEN = process.env.BOT_TOKEN ?? "";
const bot = new TelegramBot(BOT_TOKEN);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // 1. Immediate Safety Check
  if (request.method !== "POST") {
    return response.status(405).send("Method Not Allowed");
  }

  try {
    // 2. Data Parsing (Note: request.body is NOT a promise in Vercel)
    const update = request.body?.message as Message | undefined;

    if (!update) {
      return response.status(200).send("No message update received");
    }

    const { text, chat } = update;
    const utmText = text?.trim();
    const chatId = chat?.id ?? "6962583091";

    // 3. Logic: No Text Found
    if (!utmText) {
      await bot.sendMessage(chatId, "No text found in the message");
      return response.status(200).send("Acknowledged: No text");
    }

    // 4. Logic: Main Processing
    const mapInfo = getMapInfoByUtmText(utmText);

    if (mapInfo.success === false) {
      await bot.sendMessage(
        chatId,
        mapInfo.error || "Please send valid UTM coordinates."
      );
    } else {
      const { mapUrl, latitude, longitude } = mapInfo.data;

      // We use Promise.all to send these concurrently to save time
      await Promise.all([
        bot.sendLocation(chatId, latitude, longitude),
        bot.sendMessage(
          chatId,
          mapUrl ? `Here is the location: ${mapUrl}` : "Conversion failed.",
          { disable_web_page_preview: false }
        ),
      ]);
    }
  } catch (error) {
    console.error("Critical Error:", error);
    // Even if everything crashes, we tell Telegram "OK"
    // so it doesn't spam your bot with retries.
  } finally {
    // 5. The Final Acknowledge
    // This ensures Vercel closes the connection properly
    if (!response.writableEnded) {
      return response.status(200).json({ status: "success" });
    }
  }
}
