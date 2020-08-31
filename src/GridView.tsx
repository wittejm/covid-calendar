import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import { PersonData, CalculationResult } from "./types";
import { format, isValid } from "date-fns";

interface Props {
  members: PersonData[];
}
export default class GridView extends React.Component<Props> {
  render() {
    return (
      <div>
        <div className="pb3">(calendar will go here.)</div>

        {computeHouseHoldQuarantinePeriod(this.props.members).map(
          (result: CalculationResult) => {
            return (
              <div className="p32">
                {result.person.name} {" quarantined until: "}{" "}
                {isValid(result.date) && format(result.date, "MM/dd/yyyy")}
              </div>
            );
          }
        )}
        {/*<FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" />*/}
      </div>
    );
  }
}
