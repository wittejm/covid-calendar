import React, { useState } from "react";
import GridView from "./GridView";
import Household from "./Household";
import { InHouseExposureEvent, PersonData } from "./types";
import { parseISO } from "date-fns";
import { concat, compact, set, remove, flow } from "lodash/fp";
import { getRandomInt, replace } from "./util";

export default function App() {
  const initialMembers: PersonData[] = [
    {
      id: 1,
      name: `Alice`,
      covidEvents: {
        LastCloseContact: parseISO("2020-08-25")
      },
      isNewPerson: false,
      editing: false
    },
    {
      id: 2,
      name: `Bob`,
      covidEvents: {
        LastCloseContact: parseISO("2020-08-28")
      },
      isNewPerson: false,
      editing: false
    }
  ];
  const initialInHouseExposureEvents: InHouseExposureEvent[] = [];
  const [inHouseExposureEvents, setInHouseExposureEvents] = useState(
    initialInHouseExposureEvents
  );
  const [members, setMembers] = useState(initialMembers);
  const [editing, setEditing] = useState(false);
  const [id, setId] = useState(3);

  function isContagious(person: PersonData) {
    return Boolean(
      person.covidEvents.SymptomsStart || person.covidEvents.PositiveTest
    );
  }

  function setContagiousState(person: PersonData, contagious: boolean) {
    setInHouseExposureEvents(
      (inHouseExposureEvents: InHouseExposureEvent[]) => {
        const newExposureEvents = members.map((otherPerson: PersonData) => {
          if (
            person !== otherPerson &&
            contagious !== isContagious(otherPerson)
          ) {
            return {
              contagiousPerson: contagious ? person : otherPerson,
              quarantinedPerson: contagious ? otherPerson : person,
              exposed: true,
              ongoing: false,
              date: ""
            };
          }
        });
        return flow(
          remove(
            (event: InHouseExposureEvent) =>
              event.contagiousPerson === person ||
              event.quarantinedPerson === person
          ),
          concat(compact(newExposureEvents))
        )(inHouseExposureEvents);
      }
    );
  }

  function createInHouseExposureEvents(newPerson: PersonData) {
    setInHouseExposureEvents(
      (inHouseExposureEvents: InHouseExposureEvent[]) => {
        const newExposureEvents = members.map((person: PersonData) => {
          if (isContagious(person)) {
            return {
              contagiousPerson: person,
              quarantinedPerson: newPerson,
              exposed: true,
              ongoing: false,
              date: ""
            };
          }
        });
        return concat(inHouseExposureEvents, compact(newExposureEvents));
      }
    );
  }

  const handleAddNewPerson = () => {
    const newPerson = {
      id: id,
      name: `Person ${getRandomInt(1000)}`,
      covidEvents: {},
      isNewPerson: true,
      editing: true
    };
    setId(id => id + 1);
    setMembers(members => [...members, newPerson]);
    setEditing(true);
    createInHouseExposureEvents(newPerson);
  };

  const handlePersonChanges = (updatedPersonData: PersonData, id: number) => {
    setMembers(members =>
      flow(
        remove((member: PersonData) => member.id === id),
        concat(updatedPersonData)
      )(members)
    );
    setEditing(false);
  };

  const handleRemovePerson = (id: number) => {
    setMembers(members =>
      remove((member: PersonData) => member.id === id)(members)
    );
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
              inHouseExposureEvents={inHouseExposureEvents}
              setInHouseExposureEvents={setInHouseExposureEvents}
              setContagiousState={setContagiousState}
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
          <GridView
            members={members}
            inHouseExposureEvents={inHouseExposureEvents}
          />
        </div>
      </div>
    </main>
    // Persons on the left
    // Calendar on the right.
  );
}
