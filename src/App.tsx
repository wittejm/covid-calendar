import React, { useState } from "react";
import GridView from "./GridView";
import Household from "./Household";
import { PersonData, CovidEventName } from "./types";
import { parseISO } from "date-fns";

export default function App() {
  const initialMembers : PersonData[] = [
    {
      name: `Alice`,
      covidEvents: {
        LastCloseContact: parseISO("2020-08-25")
      },
      isNewPerson: false,
      editing: false
    },
    {
      name: `Bob`,
      covidEvents: {
        LastCloseContact: parseISO("2020-08-28")
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
      covidEvents: {},
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
  };

  const handleRemovePerson = (i: number) => {
    setMembers(members => [...members.slice(0, i), ...members.slice(i + 1)]);
  };

  return (
    <main className="f7 f5-l">
      <h1>Covid Quarantine Qualculator</h1>
      <div className="flex-l">
        <div className="w-70-l bw1 bg-light-gray pt5 pb5 pb7-l ph4 pr5-l">
          <div className="center mr0-l ml-auto-l">
            <Household
              members={members}
              handleAddNewPerson={handleAddNewPerson}
              handlePersonChanges={handlePersonChanges}
              handleRemovePerson={handleRemovePerson}
              editing={editing}
            />
          </div>
        </div>
        <div className="w-30-l pt2 pt5-l pb2 ph2 pr4-l">
          <GridView members={members} />
        </div>
      </div>
    </main>
    // Persons on the left
    // Calendar on the right.
  );
}
