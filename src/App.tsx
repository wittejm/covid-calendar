import React, { useEffect } from "react";
import { useState } from "@hookstate/core";
import GridView from "./GridView";
import Household from "./Household";
import { CovidEventName, InHouseExposureEvent, PersonData } from "./types";
import { compact } from "lodash/fp";
import { getRandomInt, isContagious } from "./util";

export default function App() {
  const height = useState(window.innerHeight);
  const updateHeight = () => {
    height.set(window.innerHeight);
  };
  useEffect(() => {
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);
  const members = useState([] as PersonData[]);
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

  function renderTitle() {
    if (members.get().length) {
      if (editing.get()) {
        return <h3>Please fill out questions.</h3>;
      } else {
        return <h3>Here's our recommendation for your household.</h3>;
      }
    } else {
      return <h3>Get quarantine and isolation guidance for your household.</h3>;
    }
  }

  return (
    <>
      <main className={"container"}>
        <div className={"row my-4"}>
          <div className={"col-md-6"}>
            <div>Covid Quarantine Calculator [Work in Progress]</div>
            {renderTitle()}
          </div>
          <div className={"col-md-6"} />
        </div>
        <Household
          membersState={members}
          inHouseExposureEventsState={inHouseExposureEvents}
          editingState={editing}
          eventSetterState={eventSetterState}
          addNewPerson={addNewPerson}
          height={height}
        />
        <div className={"my-5"} />
        <GridView
          membersState={members}
          editing={editing.get()}
          eventSetterState={eventSetterState}
          inHouseExposureEvents={inHouseExposureEvents.get()}
        />
        <hr />
        <footer>
          <div>
            <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/isolation.html">
              Link
            </a>{" "}
            to CDC guidelines on isolation.
          </div>
          <div className="">
            <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/quarantine.html">
              Link
            </a>{" "}
            to CDC guidelines on quarantine.
          </div>
          <p>
            The guidance given in this app is based on the latest CDC guidelines
            for protecting yourself and others from the spread of COVID-19. The
            same information is available on their{" "}
            <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/index.html">
              COVID-19 webpage
            </a>
            .
          </p>
        </footer>
      </main>
    </>
  );
}
