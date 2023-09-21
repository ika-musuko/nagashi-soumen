import type { VTTCueMap } from "./VTTCueMap";

export function saveSubtitleFile(cues: VTTCueMap) {
  const srtLines: string[] = [];
  let index = 1;

  let sortedCues = Array.from(cues)
    .map(([id, cue]) => cue)
    .sort((cueA, cueB) => cueA.startTime - cueB.startTime);

  for (const cue of sortedCues) {
    const startTimeFormatted = formatTime(cue.startTime);
    const endTimeFormatted = formatTime(cue.endTime);

    srtLines.push(`${index}`);
    srtLines.push(`${startTimeFormatted} --> ${endTimeFormatted}`);
    srtLines.push(cue.text);
    srtLines.push("");
    index++;
  }

  const srtContent = srtLines.join("\n");
  const blob = new Blob([srtContent], { type: "text/srt" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "captions.srt";
  document.body.appendChild(a);
  a.click();

  // Clean up by revoking the object URL
  URL.revokeObjectURL(url);
}

function formatTime(time: number): string {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  const milliseconds = Math.floor((time % 1) * 1000);
  return `${hours}:${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds, 3)}`;
}

function padZero(num: number, width: number = 2): string {
  const numString = num.toString();
  return numString.length >= width ? numString : new Array(width - numString.length + 1).join("0") + numString;
}