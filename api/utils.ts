import utm from "utm";

import type { FailureResult, SuccessResult, Utm } from "./types";

export const getMapInfoByUtmText = (
  text: string
):
  | SuccessResult<{ mapUrl: string; latitude: number; longitude: number }>
  | FailureResult => {
  if (!text) return { success: false, error: "Input text is empty" };
  const parsedUtm = parseUtm(text);

  if (parsedUtm.success === false) {
    return { success: false, error: parsedUtm.error };
  }
  const { x, y } = parsedUtm.data;

  const { latitude, longitude } = utmToLatLng({
    zone: 36,
    easting: x,
    northing: y,
    hemisphere: "N",
  });
  const mapUrl = createGoogleMapsLink(latitude, longitude);

  return { success: true, data: { mapUrl, latitude, longitude } };
};

function parseUtm(
  text: string
): SuccessResult<{ x: number; y: number }> | FailureResult {
  // Check if text contains alphanumeric characters (format 1: "X: 709163, Y: 3561165, Zone: 36S")
  const hasAlphanumeric = /[a-zA-Z]/.test(text);

  let x: number;
  let y: number;

  if (hasAlphanumeric) {
    // Format 1: "X: 709163, Y: 3561165, Zone: 36S"
    const xMatch = text.match(/X:\s*([\d.]+)/i);
    const yMatch = text.match(/Y:\s*([\d.]+)/i);

    try {
      if (!xMatch) {
        throw new Error("Couldn't find a valid X coordinate (e.g. X: 710604)");
      }

      if (!yMatch) {
        throw new Error("Couldn't find a valid Y coordinate (e.g. Y: 3560205)");
      }

      x = parseFloat(xMatch[1]);
      y = parseFloat(yMatch[1]);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  } else {
    // Format 2: "709163,3561165"
    const parts = text.split(",").map((part) => part.trim());

    try {
      if (parts.length !== 2) {
        throw new Error("Expected format: 'x,y' (e.g. '709163,3561165')");
      }

      x = parseFloat(parts[0]);
      y = parseFloat(parts[1]);

      if (isNaN(x) || isNaN(y)) {
        throw new Error("Invalid coordinates. Both x and y must be numbers.");
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  return {
    success: true,
    data: { x, y },
  };
}

function createGoogleMapsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function utmToLatLng({ zone, easting, northing, hemisphere }: Utm) {
  const result = utm.toLatLon(easting, northing, zone, hemisphere);

  return result;
}
