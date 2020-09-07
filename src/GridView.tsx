import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import {
  PersonData,
  CalculationResult,
  InHouseExposureEvent,
  CovidEventName
} from "./types";
import { format } from "date-fns";
import { State } from "@hookstate/core/dist";
interface Props {
  membersState: State<PersonData[]>;
  inHouseExposureEvents: InHouseExposureEvent[];
  editing: number | undefined;
  editingDateFieldState: State<CovidEventName | undefined>;
}

export default function GridView(props: Props) {
  const members = props.membersState.get();
  const editingDateField = props.editingDateFieldState.get();
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
        <div className={editingDateField ? "ba bw2 b--light-yellow" : ""}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={computeEvents(members, props.inHouseExposureEvents)}
            dateClick={(info: DateClickArg) => {
              if (props.editing && editingDateField) {
                const index = props.membersState.findIndex(
                  memberState => memberState.get().id === props.editing
                );
                props.membersState[index].covidEvents[editingDateField].set(
                  format(info.date, "MM/dd/yyyy")
                );
              }
            }}
          />
        </div>
      }
    </div>
  );
}
