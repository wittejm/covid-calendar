import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import {
  PersonData,
  CalculationResult,
  InHouseExposureEvent,
  CovidEventName
} from "./types";
import { format, isValid } from "date-fns";
import { State } from "@hookstate/core/dist";
interface Props {
  membersState: State<PersonData[]>;
  inHouseExposureEvents: InHouseExposureEvent[];
  editing: number;
  selectingDateFieldState: State<CovidEventName | undefined>;
}

export default function GridView(props: Props) {
  const members = props.membersState.get();
  const selectingDateField = props.selectingDateFieldState.get();
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
        <div className={selectingDateField ? "ba bw2 b--light-yellow" : ""}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={computeEvents(members, props.inHouseExposureEvents)}
            dateClick={(info: any) => {
              if (props.editing >= 0 && selectingDateField) {
                props.membersState[props.editing - 1].covidEvents[
                  selectingDateField
                ].set(format(info.date, "MM/dd/yyyy"));
              }
            }}
          />
        </div>
      }
    </div>
  );
}
