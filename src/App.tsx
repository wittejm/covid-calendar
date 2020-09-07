import React from "react";
import { useState } from "@hookstate/core";
import GridView from "./GridView";
import Household from "./Household";
import { CovidEventName, InHouseExposureEvent, PersonData } from "./types";
import { compact } from "lodash/fp";
import { getRandomInt, isContagious } from "./util";

export default function App() {
  const initialMembers: PersonData[] = [
    {
      id: 1,
      name: `Alice`,
      covidEvents: {
        [CovidEventName.LastCloseContact]: "8/25/2020",
        [CovidEventName.SymptomsStart]: "",
        [CovidEventName.SymptomsEnd]: "",
        [CovidEventName.PositiveTest]: ""
      },
      isNewPerson: false,
      editing: false
    },
    {
      id: 2,
      name: `Bob`,
      covidEvents: {
        [CovidEventName.LastCloseContact]: "8/28/2020",
        [CovidEventName.SymptomsStart]: "",
        [CovidEventName.SymptomsEnd]: "",
        [CovidEventName.PositiveTest]: ""
      },
      isNewPerson: false,
      editing: false
    }
  ];
  const members = useState(initialMembers);
  const inHouseExposureEvents = useState<InHouseExposureEvent[]>([]);
  const editing = useState<number | undefined>(undefined);
  const id = useState(members.length + 1);
  const editingDateField = useState<CovidEventName | undefined>(undefined);

  function createInHouseExposureEvents(newPerson: PersonData) {
    const newExposureEvents = members.get().map((person: PersonData) => {
      if (isContagious(person)) {
        return {
          contagiousPerson: person.id,
          quarantinedPerson: newPerson.id,
          exposed: true,
          ongoing: true,
          date: ""
        };
      }
    });
    inHouseExposureEvents.merge(compact(newExposureEvents));
  }

  const addNewPerson = () => {
    const currentId = id.get();
    const newPerson = {
      id: currentId,
      name: `Person ${getRandomInt(1000)}`,
      covidEvents: {
        [CovidEventName.LastCloseContact]: "",
        [CovidEventName.SymptomsStart]: "",
        [CovidEventName.SymptomsEnd]: "",
        [CovidEventName.PositiveTest]: ""
      },
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
          <div className="white f7 fw5">
            This page is a work in progress. Its instructions may be incorrect.
            Consult{" "}
            <a href="https://multco.us/novel-coronavirus-covid-19/if-you-have-been-around-someone-covid-19">
              the MultCo website
            </a>{" "}
            or the latest CDC guildlines for accurate Covid information.{" "}
          </div>
        </div>
      </div>
      <main className={"row"}>
        <div className={"col-md-5"}>
          <Household
            membersState={members}
            inHouseExposureEventsState={inHouseExposureEvents}
            editingState={editing}
            editingDateFieldState={editingDateField}
            addNewPerson={addNewPerson}
          />
        </div>
        <div className={"col-md-7"}>
          <GridView
            membersState={members}
            editing={editing.get()}
            editingDateFieldState={editingDateField}
            inHouseExposureEvents={inHouseExposureEvents.get()}
          />
        </div>
      </main>
    </>
  );
}
