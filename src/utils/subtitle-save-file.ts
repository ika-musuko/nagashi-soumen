import type { Subtitle } from "../models/Subtitle";

export function saveSubtitleFile(subs: Subtitle[]) {
  const srtLines: string[] = [];
  let index = 1;

  // this should already be sorted by startTime
  // TODO: investigate if this is really necessary
  let sortedSubs = Array.from(subs)
    .sort((s1, s2) => s1.startTime - s2.startTime);

  for (const sub of sortedSubs) {
    const startTimeFormatted = formatTime(sub.startTime);
    const endTimeFormatted = formatTime(sub.endTime);

    srtLines.push(`${index}`);
    srtLines.push(`${startTimeFormatted} --> ${endTimeFormatted}`);
    srtLines.push(sub.text);
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