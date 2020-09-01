import React, { useState } from "react";
import GridView from "./GridView";
import Household from "./Household";
import { PersonData } from "./types";
import { parseISO } from "date-fns";

export default function App() {
  const initialMembers: PersonData[] = [
    {
      name: `Alice`,
      covidEvents: {
        LastCloseContact: parseISO("2020-08-25"),
        InHouseExposure: {}
      },
      isNewPerson: false,
      editing: false
    },
    {
      name: `Bob`,
      covidEvents: {
        LastCloseContact: parseISO("2020-08-28"),
        InHouseExposure: {}
      },
      isNewPerson: false,
      editing: false
    }
  ];

  const [members, setMembers] = useState(initialMembers);
  const [editing, setEditing] = useState(false);

  const handleAddNewPerson = () => {
    const newPerson = {
      name: `Person ${members.length + 1}`,
      covidEvents: {
        InHouseExposure: {}
      },
      isNewPerson: true,
      editing: true
    };
    setMembers(members => [...members, newPerson]);
    setEditing(true);
  };

  const handlePersonChanges = (updatedPersonData: PersonData, i: number) => {
    setMembers(members => [
      ...members.slice(0, i),
      updatedPersonData,
      ...members.slice(i + 1)
    ]);
    setEditing(false);
  };
  const handleRemovePerson = (i: number) => {
    setMembers(members => [...members.slice(0, i), ...members.slice(i + 1)]);
    setEditing(false);
  };

  return (
    <main className="mt5 f7 f5-m f4-l bg-white ba b-black">
      <h1 className="ph3">Covid Quarantine Calculator</h1>
      <div className="flex-l">
        <div
          className={"bw1 pb5 pb7-l pr5-l " + (editing ? "w-70-l" : "w-50-l")}
        >
          <div className="center mr0-l ml-auto-l">
            <Household
              members={members}
              handleAddNewPerson={handleAddNewPerson}
              handlePersonChanges={handlePersonChanges}
              handleRemovePerson={handleRemovePerson}
              handleBeginEdit={() => {
                setEditing(true);
              }}
              handleCancelEdit={() => {
                setEditing(false);
              }}
              editing={editing}
            />
          </div>
        </div>
        <div
          className={
            "pt2 pt5-l pb2 ph2 pr4-l " + (editing ? "w-30-l" : "w-50-l")
          }
        >
          <GridView members={members} />
        </div>
      </div>
    </main>
    // Persons on the left
    // Calendar on the right.
  );
}
