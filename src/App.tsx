import React, { useEffect } from "react";
import { useState } from "@hookstate/core";
import Household from "./Household";
import Home from "./Home";
import { CovidEventName, InHouseExposure, PersonData } from "./types";
import { compact } from "lodash/fp";
import { getRandomInt, isContagious } from "./util";
import ReactModal from "react-modal";

export default function App() {
  const height = useState(window.innerHeight);
  const updateHeight = () => {
    height.set(window.innerHeight);
  };
  useEffect(() => {
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);
  const firstPerson = {
    id: 1,
    name: `Person 1`,
    covidEvents: {
      [CovidEventName.LastCloseContact]: "",
      [CovidEventName.SymptomsStart]: "",
      [CovidEventName.PositiveTest]: ""
    },
    symptomsChecked: [false, false, false, false],
    noSymptomsFor24Hours: true,
    feelingSick: false,
    isNewPerson: true,
    editing: true
  };

  const members = useState([firstPerson] as PersonData[]);
  const inHouseExposureEvents = useState<InHouseExposure[]>([]);
  const id = useState(2);
  const editingHouseholdState = useState(true);
  const editingPersonState = useState<number | undefined>(undefined);
  const showModalState = useState(false);

  function addNewPerson() {
    const currentId = id.get();
    const newPerson = {
      id: currentId,
      name: `Person ${members.length+1}`,
      covidEvents: {
        [CovidEventName.LastCloseContact]: "",
        [CovidEventName.SymptomsStart]: "",
        [CovidEventName.PositiveTest]: ""
      },
      symptomsChecked: [false, false, false, false],
      noSymptomsFor24Hours: true,
      feelingSick: false,
      isNewPerson: true,
      editing: true
    };
    id.set(id => id + 1);
    members.set(members => [...members, newPerson]);
    editingPersonState.set(currentId);
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
      <ReactModal
        isOpen={showModalState.get()}
        className={showModalState.get() ? "slide-in" : "slide-out"}
        style={{
          overlay: {
            zIndex: 1
          },
          content: {
            position: "absolute",
            inset: "0px",
            padding: "0px",
            background: "none",
            border: "none",
            borderRadius: "none",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            outline: "none"
          }
        }}
      >
        <Household
          addNewPerson={addNewPerson}
          editingHouseholdState={editingHouseholdState}
          height={height}
          inHouseExposureEventsState={inHouseExposureEvents}
          membersState={members}
          showModalState={showModalState}
        />
      </ReactModal>
      <Home
        membersState={members}
        inHouseExposureEventsState={inHouseExposureEvents}
        showModalState={showModalState}
      />
    </>
  );
}
