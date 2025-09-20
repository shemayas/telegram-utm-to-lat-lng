import utm from "utm";
import { Utm } from "./types";

export const getMapInfoByUtmText = (text: string) => {
  if (!text) throw new Error();

  const { zone, easting, northing, hemisphere } = parseUtm(text);

  const { latitude, longitude } = utmToLatLng({
    zone,
    easting,
    northing,
    hemisphere,
  });
  const mapUrl = createGoogleMapsLink(latitude, longitude);

  return { mapUrl, latitude, longitude };
};

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

function createGoogleMapsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function utmToLatLng({ zone, easting, northing, hemisphere }: Utm) {
  const result = utm.toLatLon(easting, northing, zone, hemisphere);

  return result;
}
