import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import { colors } from "./types";

import { PersonData, CalculationResult, InHouseExposureEvent } from "./types";
import { format, parseISO } from "date-fns";
import { State } from "@hookstate/core/dist";
interface Props {
  membersState: State<PersonData[]>;
  inHouseExposureEvents: InHouseExposureEvent[];
  editing: number | undefined;
  eventSetterState: State<((date: string) => void) | undefined>;
}

export default function GridView(props: Props) {
  const members = props.membersState.get();
  const eventSetter = props.eventSetterState.get();
  function computeEvents(
    members: PersonData[],
    inHouseExposureEvents: InHouseExposureEvent[]
  ) {
    return computeHouseHoldQuarantinePeriod(members, inHouseExposureEvents).map(
      (result: CalculationResult) => {
        return {
          classNames: ["TODO"],
          title: result.person.name,
          start: parseISO("1970-01-01"),
          end: result.endDate,
          color: colors[result.person.id - (1 % colors.length)],
          textColor: "#000000"
        };
      }
    );
  }

  return (
    <div className={"p-3"}>
      {
        <div className={eventSetter ? "ba bw2 b--light-yellow" : ""}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={computeEvents(members, props.inHouseExposureEvents)}
            dateClick={(info: DateClickArg) => {
              if (eventSetter) {
                eventSetter(format(info.date, "MM/dd/yyyy"));
              }
            }}
          />
        </div>
      }
    </div>
  );
}
