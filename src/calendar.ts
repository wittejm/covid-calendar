import fileDownload from "js-file-download";
import { createEvent, DateArray } from "ics";
import { format } from "date-fns";

export function downloadEvent(
  title: string,
  message: string,
  start: Date,
  end: Date
) {
  return () => {
    const startDateArray = format(start, "yyyy-M-d")
      .split("-")
      .map(s => Number(s)) as DateArray;
    const endDateArray = format(end, "yyyy-M-d")
      .split("-")
      .map(s => Number(s)) as DateArray;
    createEvent(
      {
        title: title,
        description: message,
        start: startDateArray,
        end: endDateArray
      },
      (error, value) => {
        if (error) {
          console.log(error);
        } else {
          fileDownload(value, "covid_event.ics");
        }
      }
    );
  };
}
