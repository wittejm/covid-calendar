import React, { useState } from "react";
import { PersonData } from "./types";
import Person from "./Person";

interface Props {
  members: PersonData[];
  handleAddNewPerson: Function;
  handlePersonChanges: Function;
  handleRemovePerson: Function;
  editing: boolean;
}

export default function Household(props: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="">
      <div className="f3">Household</div>
      <div className="pa2">
        {props.members.map((personData: PersonData, i) => {
          return (
            <Person
              personIndex={i}
              personData={personData}
              submitPersonData={(
                updatedPersonData: PersonData,
                index: number
              ) => {
                setEditing(false);
                props.handlePersonChanges(updatedPersonData, index);
              }}
              handleRemovePerson={() => {
                props.handleRemovePerson(i);
                setEditing(false);
              }}
              handleBeginEdit={() => {
                setEditing(true);
              }}
              handleCancelEdit={() => {
                if (personData.isNewPerson) {
                  props.handleRemovePerson(i);
                }
                setEditing(false);
              }}
              editingHousehold={editing}
            />
          );
        })}
        {!editing && (
          <button
            className="pa2 f5 fw6"
            onClick={() => {
              props.handleAddNewPerson();
              setEditing(true);
            }}
          >
            Add Person
          </button>
        )}
      </div>
    </div>
  );
}
