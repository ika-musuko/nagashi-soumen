export function timeDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const milliseconds = Math.round(
    (remainingSeconds - Math.floor(remainingSeconds)) * 1000
  );

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = Math.floor(remainingSeconds)
    .toString()
    .padStart(2, "0");
  const formattedMilliseconds = milliseconds.toString().padStart(3, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
}
