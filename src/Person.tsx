import React, { useState } from "react";
import { PersonData, CovidEvents, InHouseExposureEvent } from "./types";
import { parse, format } from "date-fns";
import InHouseExposureQuestions from "./InHouseExposureQuestions";
import { replace } from "./util";

interface Props {
  personIndex: number;
  householdPersonData: PersonData[];
  inHouseExposureEvents: InHouseExposureEvent[];
  setContagiousState: Function;
  setInHouseExposureEvents: Function;
  submitPersonData: Function;
  handleCancelEdit: Function;
  handleBeginEdit: Function;
  handleRemovePerson: Function;
  editingHousehold: boolean;
}

export default function Person(props: Props) {
  const personData = props.householdPersonData.find(
    person => person.id === props.personIndex
  );

  const lastCloseContactDate = personData?.covidEvents.LastCloseContact
    ? format(personData.covidEvents.LastCloseContact, "M/dd/yyyy")
    : "";
  const initialPositiveTestDate = personData?.covidEvents.PositiveTest
    ? format(personData.covidEvents.PositiveTest, "M/dd/yyyy")
    : "";
  const initialFirstSymptomsDate = personData?.covidEvents.SymptomsStart
    ? format(personData.covidEvents.SymptomsStart, "M/dd/yyyy")
    : "";
  const symptomsResolved = personData?.covidEvents.SymptomsEnd
    ? format(personData.covidEvents.SymptomsEnd, "M/dd/yyyy")
    : "";

  let relevantInHouseExposureEvents = props.inHouseExposureEvents.filter(
    event =>
      event.contagiousPerson.name === personData?.name ||
      event.quarantinedPerson.name === personData?.name
  );

  const initialState = {
    id: personData?.id,
    name: personData?.name,
    lastCloseContactDate,
    symptomsResolved
  };
  const [positiveTestDate, setPositiveTestDate] = useState(
    initialPositiveTestDate
  );
  const [firstSymptomsDate, setFirstSymptomsDate] = useState(
    initialFirstSymptomsDate
  );
  const [state, setState] = useState(initialState);
  const [editing, setEditing] = useState(props.editingHousehold);
  const contagious = Boolean(positiveTestDate || firstSymptomsDate);

  const handleChange = (e: React.BaseSyntheticEvent) => {
    const target = e.target;
    setState(state => {
      return { ...state, [target.name]: target.value };
    });
  };

  const handlePositiveTestChange = (e: React.BaseSyntheticEvent) => {
    const value = e.target.value;
    const nextContagious = Boolean(value !== "" || firstSymptomsDate);
    if (contagious !== nextContagious) {
      props.setContagiousState(personData, nextContagious);
    }
    setPositiveTestDate(value);
  };

  const handleFirstSymptomsChange = (e: React.BaseSyntheticEvent) => {
    const value = e.target.value;
    const nextContagious = Boolean(value !== "" || positiveTestDate);
    if (contagious !== nextContagious) {
      props.setContagiousState(personData, nextContagious);
    }
    setFirstSymptomsDate(value);
  };

  const handleSubmitClick = () => {
    let covidEvents: CovidEvents = {};
    if (state.lastCloseContactDate) {
      covidEvents.LastCloseContact = parse(
        state.lastCloseContactDate,
        "M/dd/yyyy",
        new Date()
      );
    }
    if (positiveTestDate) {
      covidEvents.PositiveTest = parse(
        positiveTestDate,
        "M/dd/yyyy",
        new Date()
      );
    }
    if (firstSymptomsDate) {
      covidEvents.SymptomsStart = parse(
        firstSymptomsDate,
        "M/dd/yyyy",
        new Date()
      );
    }
    const personData = {
      id: state.id,
      name: state.name,
      covidEvents: covidEvents,
      isNewPerson: false,
      editing: false
    };
    setEditing(false);
    props.submitPersonData(personData, props.personIndex);
  };

  const isContagious = Boolean(positiveTestDate || firstSymptomsDate);
  const meaningfulInHouseExposures = props.householdPersonData.filter(
    (otherPerson: PersonData) => {
      const otherPersonContagious = Boolean(
        otherPerson.covidEvents.PositiveTest ||
          otherPerson.covidEvents.SymptomsStart
      );
      return (
        personData !== otherPerson && isContagious !== otherPersonContagious
      );
    }
  );

  function updateInHouseExposure(inHouseExposureEvent: InHouseExposureEvent) {
    return (updatedInHouseExposureEvent: InHouseExposureEvent) => {
      props.setInHouseExposureEvents(
        (inHouseExposureEvents: InHouseExposureEvent[]) => {
          return replace(
            inHouseExposureEvents,
            inHouseExposureEvent,
            updatedInHouseExposureEvent
          );
        }
      );
    };
  }

  function renderCovidEvent(name: string, date: Date) {
    return (
      <div className="f5">
        {name} {": "} {format(date, "MM/dd/yyyy")}
      </div>
    );
  }

  return (
    <div className={"f4 ma2 br4 pv2 bg-light-blue"}>
      <div className="pl5 fw5">
        {personData?.name}{" "}
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
                value={positiveTestDate}
                name="positiveTestDate"
                id={`${props.personIndex}-${positiveTestDate}`}
                type="text"
                onChange={handlePositiveTestChange}
              />
            </div>
            <div className="pa2">
              <p className="pb2">
                If you are or were showing symptoms, when did your symptoms
                begin?
              </p>
              <input
                className="ml3 w4"
                value={firstSymptomsDate}
                name="firstSymptomsDate"
                id={`${props.personIndex}-${firstSymptomsDate}`}
                type="text"
                onChange={handleFirstSymptomsChange}
              />
            </div>
            <InHouseExposureQuestions
              personIndex={props.personIndex}
              meaningfulInHouseExposures={meaningfulInHouseExposures}
              relevantInHouseExposureEvents={relevantInHouseExposureEvents}
              updateInHouseExposure={updateInHouseExposure}
            />
            <button
              className="fw5 pa2 bg-green white bg-animate hover-bg-dark-green"
              onClick={handleSubmitClick}
            >
              {personData?.isNewPerson ? "Submit" : "Update"}
            </button>
            <button
              className="ma2 fw5 pa2 bg-yellow white bg-animate hover-bg-light-yellow"
              onClick={() => {
                props.handleCancelEdit();
                setEditing(false);
              }}
            >
              <span className="visually-hidden">Cancel</span>
              {personData?.isNewPerson ? "Cancel Add" : "Cancel Edit"}
              <i
                aria-hidden="true"
                className="pl2 fas fa-times-circle gray"
              ></i>
            </button>
            {!personData?.isNewPerson && (
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
            {personData?.covidEvents &&
              Object.entries(personData.covidEvents).map(
                ([eventName, eventValue]) => {
                  return renderCovidEvent(eventName, eventValue);
                }
              )}
            {Object.values(relevantInHouseExposureEvents).map(event => {
              if (event.exposed) {
                return (
                  <div className="f5">
                    {event.quarantinedPerson.name} exposed to{" "}
                    {event.contagiousPerson.name} at {event.date}
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
}
