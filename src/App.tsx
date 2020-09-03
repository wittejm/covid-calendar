import React from "react";
import { useState } from "@hookstate/core";
import GridView from "./GridView";
import Household from "./Household";
import { CalculationResult, InHouseExposureEvent, PersonData } from "./types";
import { format, isValid, parseISO } from "date-fns";
import { concat, compact, remove, flow } from "lodash/fp";
import { getRandomInt, isContagious } from "./util";

export default function App() {
  const initialMembers: PersonData[] = [
    {
      id: 1,
      name: `Alice`,
      covidEvents: {
        LastCloseContact: "8/25/2020"
      },
      isNewPerson: false,
      editing: false
    },
    {
      id: 2,
      name: `Bob`,
      covidEvents: {
        LastCloseContact: "8/28/2020"
      },
      isNewPerson: false,
      editing: false
    }
  ];
  const members = useState(initialMembers);
  const inHouseExposureEvents = useState([] as InHouseExposureEvent[]);
  const editing = useState(-1); // ID of person being edited or -1 if no one
  const id = useState(members.length + 1);
  const selectingDateFieldState = useState("");

  function createInHouseExposureEvents(newPerson: PersonData) {
    const newExposureEvents = members.get().map((person: PersonData) => {
      if (isContagious(person)) {
        return {
          contagiousPerson: person.id,
          quarantinedPerson: newPerson.id,
          exposed: true,
          ongoing: false,
          date: ""
        };
      }
    });
    inHouseExposureEvents.merge(compact(newExposureEvents));
  }

  const handleAddNewPerson = () => {
    const currentId = id.get();
    const newPerson = {
      id: currentId,
      name: `Person ${getRandomInt(1000)}`,
      covidEvents: {},
      isNewPerson: true,
      editing: true
    };
    id.set(id => id + 1);
    members.set(members => [...members, newPerson]);
    editing.set(currentId);
    createInHouseExposureEvents(newPerson);
  };

  return (
    <>
      <div className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container d-flex justify-content-between">
          <a href="#" className="navbar-brand d-flex align-items-center">
            <strong>Covid Quarantine Calculator</strong>
          </a>
        </div>
      </div>
      <main className={"row"}>
        <div className={"col-md-5"}>
          <Household
            membersState={members}
            inHouseExposureEventsState={inHouseExposureEvents}
            editingState={editing}
            handleAddNewPerson={handleAddNewPerson}
            handleFocusDateField={(fieldName: string) => {
              selectingDateFieldState.set(fieldName);
            }}
            handleUnfocusDateField={(fieldName: string) => {
              selectingDateFieldState.set("");
            }}
          />
        </div>
        <div className={"col-md-7"}>
          <GridView
            membersState={members}
            editing={editing.get()}
            selectingDateFieldState={selectingDateFieldState}
            inHouseExposureEvents={inHouseExposureEvents.get()}
          />
        </div>
      </main>
    </>
  );
}
