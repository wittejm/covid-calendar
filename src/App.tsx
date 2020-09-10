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
        [CovidEventName.PositiveTest]: ""
      },
      noSymptomsFor24Hours: true,
      isNewPerson: false,
      editing: false
    },
    {
      id: 2,
      name: `Bob`,
      covidEvents: {
        [CovidEventName.LastCloseContact]: "8/28/2020",
        [CovidEventName.SymptomsStart]: "",
        [CovidEventName.PositiveTest]: ""
      },
      noSymptomsFor24Hours: true,
      isNewPerson: false,
      editing: false
    }
  ];
  const members = useState(initialMembers);
  const inHouseExposureEvents = useState<InHouseExposureEvent[]>([]);
  const editing = useState<number | undefined>(undefined);
  const id = useState(members.length + 1);
  const eventSetterState = useState<((date: string) => void) | undefined>(
    undefined
  );

  function addNewPerson() {
    const currentId = id.get();
    const newPerson = {
      id: currentId,
      name: `Person ${getRandomInt(1000)}`,
      covidEvents: {
        [CovidEventName.LastCloseContact]: "",
        [CovidEventName.SymptomsStart]: "",
        [CovidEventName.PositiveTest]: ""
      },
      noSymptomsFor24Hours: true,
      isNewPerson: true,
      editing: true
    };
    id.set(id => id + 1);
    members.set(members => [...members, newPerson]);
    editing.set(currentId);
    const newExposureEvents = members.get().map((person: PersonData) => {
      if (isContagious(person)) {
        return {
          contagiousPerson: person.id,
          quarantinedPerson: newPerson.id,
          exposed: true,
          ongoing: true,
          date: "",
          dateMissing: false,
          dateInvalid: false
        };
      }
    });
    inHouseExposureEvents.merge(compact(newExposureEvents));
  }

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
            <a href="https://www.cdc.gov/coronavirus/2019-nCoV/index.html">
            the latest CDC guidelines{" "}
            </a>{" "}
            for accurate information on COVID-19.{" "}
          </div>
        </div>
      </div>
      <main className={"row"}>
        <div className={"col-md-5"}>
          <Household
            membersState={members}
            inHouseExposureEventsState={inHouseExposureEvents}
            editingState={editing}
            eventSetterState={eventSetterState}
            addNewPerson={addNewPerson}
          />
        </div>
        <div className={"col-md-7"}>
          <GridView
            membersState={members}
            editing={editing.get()}
            eventSetterState={eventSetterState}
            inHouseExposureEvents={inHouseExposureEvents.get()}
          />
        </div>
      </main>
    </>
  );
}
