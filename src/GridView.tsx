import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import { PersonData, CalculationResult, InHouseExposureEvent } from "./types";
import { format, isValid } from "date-fns";
import { State } from "@hookstate/core/dist";
interface Props {
  membersState: State<PersonData[]>;
  inHouseExposureEvents: InHouseExposureEvent[];
  editing: number;
  selectingDateFieldState: State<string>;
}

export default function GridView(props: Props) {
  const members = props.membersState.get();
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
        <div
          className={
            props.selectingDateFieldState.get() ? "ba bw2 b--light-yellow" : ""
          }
        >
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={computeEvents(members, props.inHouseExposureEvents)}
            dateClick={(info: any) => {
              if (props.editing >= 0) {
                props.membersState[props.editing - 1].covidEvents[
                  props.selectingDateFieldState.get()
                ].set(format(info.date, "MM/dd/yyyy"));
              }
              props.selectingDateFieldState.set("");
            }}
          />
        </div>
      }
    </div>
  );
}
