import React, { useEffect, useState as useReactState } from "react";
import { useState } from "@hookstate/core";
import Home from "./Home";
import Recommendation from "./Recommendation";
import { CovidEventName, InHouseExposure, PersonData } from "./types";
import { compact } from "lodash/fp";
import { getRandomInt, isContagious } from "./util";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { t, addLocale, useLocale } from 'ttag';

export default function App() {
  const [language, setLanguageState] = useReactState("en");
  const translationObject = require('./es.po.json');
  addLocale("es", translationObject);
  useLocale(language);
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
    name: t`Person 1`,
    covidEvents: {
      [CovidEventName.LastCloseContact]: "",
      [CovidEventName.SymptomsStart]: "",
      [CovidEventName.PositiveTest]: "",
    },
    symptomsChecked: [false, false, false, false],
    noSymptomsFor24Hours: true,
    feelingSick: false,
    vaccinated: false,
    isNewPerson: true,
    editing: true
  };

  const members = useState([firstPerson] as PersonData[]);
  const inHouseExposureEvents = useState<InHouseExposure[]>([]);
  const id = useState(2);
  const editingHouseholdState = useState(true);
  const editingPersonState = useState<number | undefined>(undefined);

  function setLanguage(language: string) {
  const from = language==="es"? "Person" : "Persona";
  const to = language==="es"? "Persona" : "Person";
  members.forEach((person)=> {
    if (person.name.get().split(" ")[0] === from) {
      person.name.set(`${to} ${person.name.get().split(" ").slice(1).join(" ")}`);
  }
  })
    setLanguageState(language);
  }

  function addNewPerson() {
    const currentId = id.get();
    const newPersonNumber = members.length+1;
    const newPerson = {
      id: currentId,
      name: t`Person ${newPersonNumber}`,
      covidEvents: {
        [CovidEventName.LastCloseContact]: "",
        [CovidEventName.SymptomsStart]: "",
        [CovidEventName.PositiveTest]: "",
      },
      symptomsChecked: [false, false, false, false],
      noSymptomsFor24Hours: true,
      feelingSick: false,
      vaccinated: false,
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
        <Route path="/recommendation">
          <Recommendation
            addNewPerson={addNewPerson}
            editingHouseholdState={editingHouseholdState}
            height={height}
            inHouseExposureEventsState={inHouseExposureEvents}
            membersState={members}
            language={language}
            setLanguage={setLanguage}
          />
        </Route>
        <Route path="/">
          <Home language={language} setLanguage={setLanguage} />
        </Route>
      </Switch>
    </Router>
  );
}
