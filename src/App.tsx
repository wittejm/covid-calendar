import React, { useEffect } from "react";
import { useState } from "@hookstate/core";
import Household from "./Household";
import Home from "./Home";
import Recommendation from "./Recommendation";
import { CovidEventName, InHouseExposure, PersonData } from "./types";
import { compact } from "lodash/fp";
import { getRandomInt, isContagious } from "./util";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

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
    <Router basename={`${process.env.PUBLIC_URL}`}>
      <Switch>
        <Route path="/household">
          <Household
            addNewPerson={addNewPerson}
            editingHouseholdState={editingHouseholdState}
            height={height}
            inHouseExposureEventsState={inHouseExposureEvents}
            membersState={members}
            showModalState={showModalState}
          />
        </Route>
        <Route path="/recommendation">
          <Recommendation
            membersState={members}
            inHouseExposureEventsState={inHouseExposureEvents}
            showModalState={showModalState}
          />
        </Route>
        <Route path="/">
          <Home
            membersState={members}
            inHouseExposureEventsState={inHouseExposureEvents}
            showModalState={showModalState}
          />
        </Route>
      </Switch>
    </Router>
  );
}
