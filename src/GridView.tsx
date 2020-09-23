import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import { colors } from "./types";

import { PersonData, Guidance, InHouseExposure } from "./types";
import { State } from "@hookstate/core";
import { compact, map, flow } from "lodash/fp";

interface Props {
  membersState: State<PersonData[]>;
  inHouseExposureEvents: InHouseExposure[];
}

export default function GridView(props: Props) {
  const members = props.membersState.get();
  function computeEvents(
    members: PersonData[],
    inHouseExposureEvents: InHouseExposure[]
  ) {
    return flow(
      map((guidance: Guidance) => {
        if (guidance.endDate) {
          return {
            classNames: ["TODO"],
            title: guidance.person.name,
            start: guidance.startDate, // startDate is guaranteed if endDate exists
            end: guidance.endDate,
            color: colors[(guidance.person.id - 1) % colors.length],
            textColor: "#000000"
          };
        }
      }),
      compact
    )(computeHouseHoldQuarantinePeriod(members, inHouseExposureEvents));
  }

  return (
    <div className={"p-3"}>
      <div>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={computeEvents(members, props.inHouseExposureEvents)}
          dateClick={(info: DateClickArg) => {}}
        />
      </div>
    </div>
  );
}
