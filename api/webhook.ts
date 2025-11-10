// import { getMapInfoByUtmText } from "./utils";
import type { VercelRequest, VercelResponse } from "@vercel/node";
// export default async function handler(request: Request) {
//   const BOT_TOKEN = process.env.BOT_TOKEN;
//   if (!BOT_TOKEN) {
//     return new Response("Missing BOT_TOKEN in environment", { status: 500 });
//   }

//   if (request.method !== "POST") {
//     return new Response("Method not allowed", { status: 405 });
//   }

//   const update = await request.json();

//   if (update.message?.text) {
//     const chatId = update.message.chat.id;
//     const text = update.message.text;

//     try {
//       const { mapUrl, latitude, longitude } = getMapInfoByUtmText(text);

//       // Send location
//       await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendLocation`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           chat_id: chatId,
//           latitude,
//           longitude,
//         }),
//       });

//       // Send message
//       await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           chat_id: chatId,
//           text: mapUrl
//             ? `Here is the location: ${mapUrl}`
//             : "Conversion failed.",
//           disable_web_page_preview: false,
//         }),
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   return new Response(JSON.stringify({ ok: true }), {
//     status: 200,
//     headers: { "Content-Type": "application/json" },
//   });
// }

// Define the shape of the data we expect in the request body
interface RequestBody {
  name: string;
}

// The main export function handles the webhook request
export default (request: VercelRequest, response: VercelResponse) => {
  // 1. Enforce POST Method
  if (request.method !== "POST") {
    return response
      .status(405)
      .json({ message: "Method Not Allowed. Please use POST." });
  }

  // 2. Safely Access and Type the Request Body
  // Vercel automatically parses the JSON body into request.body
  const body = request.body as RequestBody;

  // 3. Basic Validation
  if (!body || !body.name) {
    return response
      .status(400)
      .json({ error: 'Missing "name" property in JSON body.' });
  }

  // 4. Conversion/Processing (The core logic)
  const capitalizedName = body.name.toUpperCase();

  // 5. Send Response
  response.status(200).json({
    message: `Hello, ${capitalizedName}! Your request was successfully processed.`,
    original_input: body.name,
    processed_output: capitalizedName,
    timestamp: new Date().toISOString(),
  });
};
