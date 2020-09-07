import React from "react";
import {
  CalculationResult,
  CovidEventName,
  InHouseExposureEvent,
  PersonData
} from "./types";
import Person from "./Person";
import { State } from "@hookstate/core/dist";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import { format, isValid } from "date-fns";

interface Props {
  addNewPerson: Function;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposureEvent[]>;
  editingState: State<number | undefined>;
  editingDateFieldState: State<CovidEventName | undefined>;
}

export default function Household(props: Props) {
  const editing = props.editingState.get();
  const members = props.membersState.get();
  const inHouseExposureEvents = props.inHouseExposureEventsState.get();
  return (
    <>
      <div className="p-3">
        {!editing && (
          <button
            className="btn btn-primary mb-2"
            onClick={() => props.addNewPerson()}
          >
            <i className="fa fa-user-plus" aria-hidden="true"></i> Add Person
          </button>
        )}
        {props.membersState.map((personState: State<PersonData>) => {
          const person = personState.get();
          const id = person.id;
          return (
            <Person
              key={id}
              personState={personState}
              membersState={props.membersState}
              inHouseExposureEventsState={props.inHouseExposureEventsState}
              editingState={props.editingState}
              editingDateFieldState={props.editingDateFieldState}
            />
          );
        })}
        <hr />
        <div className={"p-1"}>
          <h4>Guidance</h4>
          {computeHouseHoldQuarantinePeriod(members, inHouseExposureEvents).map(
            (result: CalculationResult) => {
              if (isValid(result.startDate) && isValid(result.endDate)) {
                return (
                  <div className="p32">
                    {result.person.name} {" should quarantine from "}{" "}
                    {format(result.startDate, "MM/dd/yyyy")}
                    {" until "} {format(result.endDate, "MM/dd/yyyy")}
                    {"."}
                  </div>
                );
              }
            }
          )}
        </div>
      </div>
    </>
  );
}
