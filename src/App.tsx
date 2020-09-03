import React from "react";
import { useState } from "@hookstate/core";
import GridView from "./GridView";
import Household from "./Household";
import { InHouseExposureEvent, PersonData } from "./types";
import { parseISO } from "date-fns";
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
    <main className="mt5 f7 f5-m f4-l bg-white ba b-black">
      <h1 className="ph3 f3">Covid Quarantine Calculator</h1>
      <div className="flex-l">
        <div
          className={"bw1 pb5 pb7-l pr5-l " + (editing ? "w-70-l" : "w-50-l")}
        >
          <div className="center mr0-l ml-auto-l">
            <Household
              membersState={members}
              inHouseExposureEventsState={inHouseExposureEvents}
              editingState={editing}
              handleAddNewPerson={handleAddNewPerson}
              handleFocusDateField={(fieldName: string) => {
                console.log("In-app focused date field is ", fieldName);
              }}
              handleUnfocusDateField={(fieldName: string) => {
                console.log("In-app unfocused date field is ", fieldName);
              }}
            />
          </div>
        </div>
        <div
          className={
            "pt2 pt5-l pb2 ph2 pr4-l " + (editing ? "w-30-l" : "w-50-l")
          }
        >
          <GridView
            members={members.get()}
            inHouseExposureEvents={inHouseExposureEvents.get()}
          />
        </div>
      </div>
    </main>
  );
}
