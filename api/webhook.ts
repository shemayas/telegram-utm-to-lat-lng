// import { getMapInfoByUtmText } from "./utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import TelegramBot, { Message } from "node-telegram-bot-api";
const BOT_TOKEN = process.env.BOT_TOKEN ?? "";

const bot = new TelegramBot(BOT_TOKEN);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {

  if (!BOT_TOKEN) {
    return response.status(500).json({ message: "Missing BOT_TOKEN in environment" });
  }

  const update = (await request.body) as Message;
  const {
    text,
    chat: { id },
  } = update;

  if (!text) {
    response.status(400).json({ message: "No text found in the message" });
  }

  const chatId = id ?? "6962583091";
  try {
    await bot.sendLocation(chatId, 37.7749, -122.4194);
    await bot.sendMessage(chatId, "Here is a location!");
  } catch (error) {
    console.log(error);
  }

  response.status(200).json({ message: "Hello from API!" });
}

// Define the shape of the data we expect in the request body
// interface RequestBody {
//   name: string;
// }

// // The main export function handles the webhook request
// export default (request: VercelRequest, response: VercelResponse) => {
//   // 1. Enforce POST Method
//   if (request.method !== "POST") {
//     return response
//       .status(405)
//       .json({ message: "Method Not Allowed. Please use POST." });
//   }

//   // 2. Safely Access and Type the Request Body
//   // Vercel automatically parses the JSON body into request.body
//   const body = request.body as RequestBody;

//   // 3. Basic Validation
//   if (!body || !body.name) {
//     return response
//       .status(400)
//       .json({ error: 'Missing "name" property in JSON body.' });
//   }

//   // 4. Conversion/Processing (The core logic)
//   const capitalizedName = body.name.toUpperCase();

//   // 5. Send Response
//   response.status(200).json({
//     message: `Hello, ${capitalizedName}! Your request was successfully processed.`,
//     original_input: body.name,
//     processed_output: capitalizedName,
//     timestamp: new Date().toISOString(),
//   });
// };
