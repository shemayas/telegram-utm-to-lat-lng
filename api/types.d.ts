export interface Utm {
  zone: number;
  easting: number;
  northing: number;
  hemisphere: "N" | "S";
}

interface SuccessResult<T> {
  success: true; // Discriminant: MUST be the literal 'true'
  data: T; // The result data
}

interface FailureResult {
  success: false; // Discriminant: MUST be the literal 'false'
  error: string; // The error message
}
