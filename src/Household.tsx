import React from "react";
import {
  CalculationResult,
  colorNames,
  colors,
  InHouseExposureEvent,
  PersonData
} from "./types";
import Person from "./Person";
import { State } from "@hookstate/core";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import { format, isValid } from "date-fns";

interface Props {
  addNewPerson: () => void;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposureEvent[]>;
  editingState: State<number | undefined>;
  eventSetterState: State<((date: string) => void) | undefined>;
}

export default function Household(props: Props) {
  const editing = props.editingState.get();
  const members = props.membersState.get();
  const inHouseExposureEvents = props.inHouseExposureEventsState.get();
  return (
    <>
      <div className="p-3">
        {!editing && (
          <button className="btn btn-primary mb-2" onClick={props.addNewPerson}>
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
              eventSetterState={props.eventSetterState}
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
                    <span className="">
                      <i
                        style={{
                          color:
                            colors[result.person.id - (1 % colorNames.length)]
                        }}
                        className={"fa fa-xss fa-circle pr-1"}
                      ></i>
                      {result.person.name + " "}
                    </span>{" "}
                    {" should quarantine from "}{" "}
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
