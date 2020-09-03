import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import { PersonData, CalculationResult, InHouseExposureEvent } from "./types";
import { format, isValid } from "date-fns";

interface Props {
  members: PersonData[];
  inHouseExposureEvents: InHouseExposureEvent[];
}

export default function GridView(props: Props) {
  function computeEvents(
    members: PersonData[],
    inHouseExposureEvents: InHouseExposureEvent[]
  ) {
    return computeHouseHoldQuarantinePeriod(members, inHouseExposureEvents).map(
      (result: CalculationResult) => {
        return {
          classNames: ["TODO"],
          title: result.person.name,
          start: result.startDate,
          end: result.endDate
        };
      }
    );
  }

  return (
    <div className={"p-3"}>
      {
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={computeEvents(props.members, props.inHouseExposureEvents)}
        />
      }
    </div>
  );
}
