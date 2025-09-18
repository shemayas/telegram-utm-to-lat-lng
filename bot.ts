import TelegramBot, { Message } from "node-telegram-bot-api";
import utm from "utm";
import dotenv from "dotenv";

interface Utm {
  zone: number;
  easting: number;
  northing: number;
  hemisphere: "N" | "S";
}

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  throw new Error("Missing BOT_TOKEN in .env");
}

const bot = new TelegramBot(token, { polling: true });

/** Convert UTM coordinates to latitude/longitude */
function utmToLatLng({ zone, easting, northing, hemisphere }: Utm) {
  const result = utm.toLatLon(easting, northing, zone, hemisphere);

  return result;
}

function createGoogleMapsLink(latitude: number, longitude: number): string {
  // return `https://www.google.com/maps/@${latitude},${longitude},10z`;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

bot.on("message", (msg: Message) => {
  const chatId = msg.chat.id;

  try {
    const text = msg.text?.trim();
    if (!text) throw new Error();

    const { zone, easting, northing, hemisphere } = parseUtm(text);

    const { latitude, longitude } = utmToLatLng({
      zone,
      easting,
      northing,
      hemisphere,
    });
    const mapUrl = createGoogleMapsLink(latitude, longitude);

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

function parseUtm(text: string): Utm {
  const xMatch = text.match(/X:\s*([\d.]+)/i);
  const yMatch = text.match(/Y:\s*([\d.]+)/i);
  const zoneMatch = text.match(/Zone:\s*(\d+)([NS])/i);

  if (!xMatch) {
    throw new Error("Couldn't find a valid X coordinate (e.g. X: 710604)");
  }

  if (!yMatch) {
    throw new Error("Couldn't find a valid Y coordinate (e.g. Y: 3560205)");
  }

  if (!zoneMatch) {
    const rawZone = text.match(/Zone:\s*(\S+)/i)?.[1] ?? "(missing)";
    throw new Error(
      `Zone value '${rawZone}' is invalid. It must be like '36N' or '36S'`
    );
  }

  return {
    easting: parseFloat(xMatch[1]),
    northing: parseFloat(yMatch[1]),
    zone: parseInt(zoneMatch[1], 10),
    hemisphere: zoneMatch[2].toUpperCase() as "N" | "S",
  };
}
