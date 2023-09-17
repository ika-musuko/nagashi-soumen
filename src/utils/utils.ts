export function timeDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const milliseconds = Math.round(
    (remainingSeconds - Math.floor(remainingSeconds)) * 1000
  );

  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  const ss = Math.floor(remainingSeconds).toString().padStart(2, "0");
  const ms = milliseconds.toString().padStart(3, "0");

  return `${hh}:${mm}:${ss}.${ms}`;
}

export function floatEquals(a: number, b: number, epsilon: number = 0.000001): boolean {
  return Math.abs(a - b) < epsilon;
}