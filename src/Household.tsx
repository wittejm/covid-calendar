import React from "react";
import {
  CalculationResult,
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
  height: State<number>;
}

export default function Household(props: Props) {
  const editing = props.editingState.get();
  const members = props.membersState.get();
  const inHouseExposureEvents = props.inHouseExposureEventsState.get();
  const guidance = computeHouseHoldQuarantinePeriod(
    members,
    inHouseExposureEvents
  );

  return (
    <>
      <div className={""} style={{ minHeight: props.height.get() + "px" }}>
        <div className={"row"}>
          {props.membersState.map((personState: State<PersonData>) => {
            const person = personState.get();
            const id = person.id;
            const personGuidance = guidance.find(c => c.person.id === id);
            if (personGuidance) {
              return (
                <Person
                  key={id}
                  personState={personState}
                  membersState={props.membersState}
                  inHouseExposureEventsState={props.inHouseExposureEventsState}
                  editingState={props.editingState}
                  eventSetterState={props.eventSetterState}
                  guidance={personGuidance}
                />
              );
            }
          })}
        </div>
        {!editing && (
          <button
            className="btn btn-lg btn-primary my-2"
            onClick={props.addNewPerson}
          >
            <i className="fa fa-user-plus" aria-hidden="true"></i> Add Person
          </button>
        )}
      </div>
    </>
  );
}
