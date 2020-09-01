import React, { useState } from "react";
import { PersonData } from "./types";
import Person from "./Person";

interface Props {
  members: PersonData[];
  handleAddNewPerson: Function;
  handleBeginEdit: Function;
  handleCancelEdit: Function;
  handlePersonChanges: Function;
  handleRemovePerson: Function;
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
        {props.members.map((personData: PersonData, i) => {
          return (
            <Person
              personIndex={i}
              householdPersonData={props.members}
              submitPersonData={(
                updatedPersonData: PersonData,
                index: number
              ) => {
                props.handlePersonChanges(updatedPersonData, index);
              }}
              handleRemovePerson={() => {
                props.handleRemovePerson(i);
              }}
              handleBeginEdit={() => {
                props.handleBeginEdit();
              }}
              handleCancelEdit={() => {
                if (personData.isNewPerson) {
                  props.handleRemovePerson(i);
                }
                props.handleCancelEdit();
              }}
              editingHousehold={props.editing}
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
