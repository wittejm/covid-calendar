import React, { useEffect } from "react";
import { useState } from "@hookstate/core";
import Household from "./Household";
import Home from "./Home";
import { CovidEventName, InHouseExposureEvent, PersonData } from "./types";
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
  const members = useState([] as PersonData[]);
  const inHouseExposureEvents = useState<InHouseExposureEvent[]>([]);
  const id = useState(members.length + 1);
  const editingHouseholdState = useState(true);
  const editingPersonState = useState<number | undefined>(undefined);

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
            editingPersonState={editingPersonState}
            height={height}
            inHouseExposureEventsState={inHouseExposureEvents}
            membersState={members}
          />
        </Route>
        <Route path="/">
          <Home
            membersState={members}
            inHouseExposureEventsState={inHouseExposureEvents}
          />
        </Route>
      </Switch>
    </Router>
  );
}
