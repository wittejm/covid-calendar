import fileDownload from "js-file-download";
import { createEvent, DateArray } from "ics";
import { format } from "date-fns";
import JSZip from "jszip";
import { Guidance } from "./types";
export interface CalendarEvent {
  title: string;
  message: string;
  start: Date;
  end: Date;
}

export function downloadEvents(
  guidances: Guidance[]
  ) {
  const zipFile = new JSZip();

  for (let guidance of guidances) {
    const title = guidance.infected ? "Isolate" : "Quarantine";
    const message = `Recommended CDC guidance for ${guidance.person.name}.`;
    const start = guidance.startDate;
    const end = guidance.endDate;
    if ( start && end ) {
      const startDateArray = format(start, "yyyy-M-d")
        .split("-")
        .map(s => Number(s)) as DateArray;
      const endDateArray = format(end, "yyyy-M-d")
        .split("-")
        .map(s => Number(s)) as DateArray;

      const {error, value} = createEvent(
        {
          title: title,
          description: message,
          start: startDateArray,
          end: endDateArray
        });
      if (value) {
          const filename = `${guidance.person.name}-${title}-${format(end, "yyyy-M-d")}`;
          filename && zipFile.file(filename, value); // add to the zip
      } else {
        console.log(error);
      }
    }
  }
  zipFile.generateAsync({type:"blob"}).then(function(content) {
    fileDownload(content, "calendar_events.zip");
  });
}
