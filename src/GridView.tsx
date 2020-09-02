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
    <div>
      <div className="pb3">(calendar will go here.)</div>
      {computeHouseHoldQuarantinePeriod(
        props.members,
        props.inHouseExposureEvents
      ).map((result: CalculationResult) => {
        return (
          <div className="p32">
            {result.person.name} {" quarantined from "}{" "}
            {isValid(result.startDate) &&
              format(result.startDate, "MM/dd/yyyy")}
            {" until "}{" "}
            {isValid(result.endDate) && format(result.endDate, "MM/dd/yyyy")}
          </div>
        );
      })}
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
