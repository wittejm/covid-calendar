import React, { useState } from "react";
import { InHouseExposureEvent, PersonData } from "./types";
import Person from "./Person";

interface Props {
  members: PersonData[];
  inHouseExposureEvents: InHouseExposureEvent[];
  setInHouseExposureEvents: Function;
  setContagiousState: Function;
  handleAddNewPerson: Function;
  handleBeginEdit: Function;
  handleCancelEdit: Function;
  handlePersonChanges: Function;
  handleRemovePerson: Function;
  handleFocusDateField: Function;
  handleUnfocusDateField: Function;
  editing: boolean;
}

export default function Household(props: Props) {
  return (
    <div className="">
      <div className="f3 pa3">
        {" "}
        <span className="bg-light-green pv2 ph2 mr2 f7"> (icon) </span>{" "}
        Household
      </div>
      <div className="pa2">
        {props.members
          .sort((p1, p2) => p1.id - p2.id)
          .map((personData: PersonData) => {
            return (
              <Person
                key={personData.id}
                id={personData.id}
                members={props.members}
                inHouseExposureEvents={props.inHouseExposureEvents}
                setContagiousState={props.setContagiousState}
                setInHouseExposureEvents={props.setInHouseExposureEvents}
                submitPersonData={(
                  updatedPersonData: PersonData,
                  index: number
                ) => {
                  props.handlePersonChanges(updatedPersonData, index);
                }}
                handleRemovePerson={() => {
                  props.handleRemovePerson(personData.id);
                }}
                handleBeginEdit={() => {
                  props.handleBeginEdit();
                }}
                handleCancelEdit={() => {
                  if (personData.isNewPerson) {
                    props.handleRemovePerson(personData.id);
                  }
                  props.handleCancelEdit();
                }}
                editingHousehold={props.editing}
                handleFocusDateField={props.handleFocusDateField}
                handleUnfocusDateField={props.handleUnfocusDateField}
              />
            );
          })}

        {!props.editing && (
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
