import React, { useState } from "react";
import { PersonData, CovidEvents, InHouseExposureEvents } from "./types";
import { parse, format } from "date-fns";
import { Map } from "immutable";

interface Props {
  personIndex: number;
  householdPersonData: PersonData[];
  submitPersonData: Function;
  handleCancelEdit: Function;
  handleBeginEdit: Function;
  handleRemovePerson: Function;
  editingHousehold: boolean;
}

export default function Person(props: Props) {
  const personData = props.householdPersonData[props.personIndex];

  const lastCloseContactDate = personData.covidEvents.LastCloseContact
    ? format(personData.covidEvents.LastCloseContact, "M/dd/yyyy")
    : "";
  const positiveTestDate = personData.covidEvents.PositiveTest
    ? format(personData.covidEvents.PositiveTest, "M/dd/yyyy")
    : "";
  const firstSymptomsDate = personData.covidEvents.SymptomsStart
    ? format(personData.covidEvents.SymptomsStart, "M/dd/yyyy")
    : "";
  const symptomsResolved = personData.covidEvents.SymptomsEnd
    ? format(personData.covidEvents.SymptomsEnd, "M/dd/yyyy")
    : "";

  let initialInHouseExposureFields: Map<string, string> = personData.covidEvents
    .InHouseExposure
    ? Map(personData.covidEvents.InHouseExposure).map((date: Date) =>
        format(date, "MM/dd/yyyy")
      )
    : Map();

  const initialState = {
    name: personData.name,
    lastCloseContactDate,
    positiveTestDate,
    firstSymptomsDate,
    symptomsResolved
  };
  const [state, setState] = useState(initialState);
  const [inHouseExposureFields, setInHouseExposureFields] = useState(
    initialInHouseExposureFields
  );
  const [editing, setEditing] = useState(props.editingHousehold);

  const handleChange = (e: React.BaseSyntheticEvent) => {
    const target = e.target;
    setState(state => {
      return { ...state, [target.name]: target.value };
    });
  };

  const handleSubmitClick = () => {
    let covidEvents: CovidEvents = { InHouseExposure: {} };
    if (state.lastCloseContactDate) {
      covidEvents.LastCloseContact = parse(
        state.lastCloseContactDate,
        "M/dd/yyyy",
        new Date()
      );
    }
    if (state.positiveTestDate) {
      covidEvents.PositiveTest = parse(
        state.positiveTestDate,
        "M/dd/yyyy",
        new Date()
      );
    }
    if (state.firstSymptomsDate) {
      covidEvents.SymptomsStart = parse(
        state.firstSymptomsDate,
        "M/dd/yyyy",
        new Date()
      );
    }
    covidEvents.InHouseExposure = inHouseExposureFields
      .map((date: string) => parse(date, "M/dd/yyyy", new Date()))
      .toObject();
    const personData = {
      name: state.name,
      covidEvents: covidEvents,
      isNewPerson: false,
      editing: false
    };
    setEditing(false);
    props.submitPersonData(personData, props.personIndex);
  };

  const inHouseExposureNames = props.householdPersonData
    .filter((otherPerson: PersonData) => {
      const personContagious = Boolean(
        state.positiveTestDate || state.firstSymptomsDate
      );
      const otherPersonContagious = Boolean(
        otherPerson.covidEvents.PositiveTest ||
          otherPerson.covidEvents.SymptomsStart
      );
      return (
        state.name !== otherPerson.name &&
        personContagious !== otherPersonContagious
      );
    })
    .map((person, index) => {
      return person.name;
    });

  function renderCovidEvent(name: string, date: Date) {
    return (
      <div className="f5">
        {name} {": "} {format(date, "MM/dd/yyyy")}
      </div>
    );
  }

  function renderInHouseExposureEvents(
    inHouseExposureEvents: InHouseExposureEvents
  ) {
    if (inHouseExposureEvents) {
      return Object.entries(inHouseExposureEvents).map(
        ([name, date]: [string, Date]) => {
          return (
            <div className="f5">
              Exposed to {name} {": "} {format(date, "MM/dd/yyyy")}
            </div>
          );
        }
      );
    } else {
      return <></>;
    }
  }

  return (
    <div className={"f4 ma2 br4 pv2 bg-light-blue"}>
      <div className="pl5 fw5">
        {personData.name}{" "}
        {!props.editingHousehold && (
          <button
            onClick={() => {
              props.handleBeginEdit();
              setEditing(true);
            }}
          >
            <span className="visually-hidden">Edit Person</span>
            <span aria-hidden="true" className="pl2 f5 fas fa-pen"></span>
          </button>
        )}
      </div>
      <div className={editing ? "" : "pl5"}>
        {editing ? (
          <div className="pa3">
            <div className="pa2">
              Name:
              <input
                className="w4"
                value={state.name}
                name="name"
                id={`${props.personIndex}-${state.name}`}
                type="text"
                onChange={handleChange}
              />
            </div>

            <div className="pa2">
              <p className="pb2">
                When is the last date you have been exposed to someone covid
                positive outside the household?
              </p>
              <input
                className="ml3 w4"
                value={state.lastCloseContactDate}
                name="lastCloseContactDate"
                id={`${props.personIndex}-${state.lastCloseContactDate}`}
                type="text"
                /*
              Accessibility Stuff TODO.
              required={this.props.required}
              aria-invalid={this.state.hasInput}
              aria-describedby={
                this.props.required && this.state.hasInput
                  ? this.props.errorMessage
                  : undefined
              }
              */
                onChange={handleChange}
              />
            </div>
            <div className="pa2">
              <p className="pb2">
                If you have received a positive test result, what date did you
                take the test?
              </p>
              <input
                className="ml3 w4"
                value={state.positiveTestDate}
                name="positiveTestDate"
                id={`${props.personIndex}-${state.positiveTestDate}`}
                type="text"
                onChange={handleChange}
              />
            </div>
            <div className="pa2">
              <p className="pb2">
                If you are or were showing symptoms, when did your symptoms
                begin?
              </p>
              <input
                className="ml3 w4"
                value={state.firstSymptomsDate}
                name="firstSymptomsDate"
                id={`${props.personIndex}-${state.firstSymptomsDate}`}
                type="text"
                onChange={handleChange}
              />
            </div>
            {inHouseExposureNames.map((personName, index) => {
              return (
                <div className="pa2">
                  <p className="pb2">
                    When was your last exposure to {personName}?
                  </p>
                  <input
                    className="ml3 w4"
                    value={inHouseExposureFields.get(personName) || ""}
                    name={`crossExposure-${index}`}
                    id={`crossExposure-${props.personIndex}-${index}`}
                    type="text"
                    onChange={(e: React.BaseSyntheticEvent) => {
                      const target = e.target;
                      setInHouseExposureFields(inHouseExposureFields =>
                        inHouseExposureFields.set(personName, target.value)
                      );
                    }}
                  />
                </div>
              );
            })}
            <button
              className="fw5 pa2 bg-green white bg-animate hover-bg-dark-green"
              onClick={handleSubmitClick}
            >
              {personData.isNewPerson ? "Submit" : "Update"}
            </button>
            <button
              className="ma2 fw5 pa2 bg-yellow white bg-animate hover-bg-light-yellow"
              onClick={() => {
                props.handleCancelEdit();
                setEditing(false);
              }}
            >
              <span className="visually-hidden">Cancel</span>
              {personData.isNewPerson ? "Cancel Add" : "Cancel Edit"}
              <i
                aria-hidden="true"
                className="pl2 fas fa-times-circle gray"
              ></i>
            </button>
            {!personData.isNewPerson && (
              <button
                className="ma2 fw5 pa2 bg-washed-red bg-animate hover-bg-light-red"
                onClick={() => {
                  props.handleRemovePerson();
                  setEditing(false);
                }}
              >
                <span className="visually-hidden">Remove</span>
                Remove
                <i
                  aria-hidden="true"
                  className="pl2 fas fa-times-circle gray"
                ></i>
              </button>
            )}
          </div>
        ) : (
          <div className="pl3">
            {Object.entries(personData.covidEvents).map(
              ([eventName, eventValue]) => {
                if (eventName === "InHouseExposure") {
                  return renderInHouseExposureEvents(eventValue);
                } else {
                  return renderCovidEvent(eventName, eventValue);
                }
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}
