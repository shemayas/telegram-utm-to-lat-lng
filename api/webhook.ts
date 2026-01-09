import type { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { getMapInfoByUtmText } from "./utils";

const BOT_TOKEN = process.env.BOT_TOKEN ?? "";
const bot = new TelegramBot(BOT_TOKEN);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (!BOT_TOKEN) {
    console.log({ message: "Missing BOT_TOKEN in environment" });
    return response
      .status(200)
      .json({ message: "Missing BOT_TOKEN in environment" });
  }

  const update = (await request?.body?.message) as Message | undefined;
  console.log({ update });
  const { text, chat } = update ?? {};
  const utmText = text?.trim();
  const chatId = chat?.id ?? "6962583091";

  if (!utmText) {
    await bot.sendMessage(chatId, "No text found in the message");
    return response.status(200).send("OK");
  }

  try {
    const mapInfo = getMapInfoByUtmText(utmText);
    if (mapInfo.success === false) {
      throw new Error(mapInfo.error);
    }
    const { mapUrl, latitude, longitude } = mapInfo.data;
    await bot.sendLocation(chatId, latitude, longitude);
    await bot.sendMessage(
      chatId,
      mapUrl ? `Here is the location: ${mapUrl}` : "Conversion failed.",
      { disable_web_page_preview: false }
    );
  } catch (error) {
    const msg =
      (error instanceof Error ? error.message : String(error)) ||
      "Please send valid UTM coordinates.";
    await bot.sendMessage(chatId, msg);
    return response.status(200).json({ message: msg });
  }
  return response.status(200).json({ message: "Webhook handled" });
}
