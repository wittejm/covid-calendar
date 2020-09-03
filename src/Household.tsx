import React from "react";
import { InHouseExposureEvent, PersonData } from "./types";
import Person from "./Person";
import { State } from "@hookstate/core/dist";

interface Props {
  handleAddNewPerson: Function;
  handleFocusDateField: Function;
  handleUnfocusDateField: Function;

  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposureEvent[]>;
  editingState: State<number>;
}

export default function Household(props: Props) {
  const editing = props.editingState.get();
  return (
    <div className="">
      <div className="f3 pa3">
        {" "}
        <span className="bg-light-green pv2 ph2 mr2 f7"> (icon) </span>{" "}
        Household
      </div>
      <div className="pa2">
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
              handleFocusDateField={props.handleFocusDateField}
              handleUnfocusDateField={props.handleUnfocusDateField}
            />
          );
        })}
        {editing === -1 && (
          <button
            className="pa2 f5 fw6"
            onClick={() => {
              props.handleAddNewPerson();
            }}
          >
            Add Person
          </button>
        )}
      </div>
    </div>
  );
}
