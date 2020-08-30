import React, { useState } from "react";
import { PersonData, CovidEvents, CovidEventName } from "./types";
import { parse, format } from "date-fns";

interface Props {
  personIndex: number;
  personData: PersonData;
  submitPersonData: Function;
  handleCancelEdit: Function;
  handleBeginEdit: Function;
  handleRemovePerson: Function;
  editingHousehold: boolean;
}

export default function Person(props: Props) {
  const lastCloseContactDate = props.personData.covidEvents.LastCloseContact ? format(props.personData.covidEvents.LastCloseContact, "M/dd/yyyy") : "";
  const positiveTestDate = props.personData.covidEvents.PositiveTest ? format(props.personData.covidEvents.PositiveTest, "M/dd/yyyy") : "";
  const firstSymptomsDate = props.personData.covidEvents.SymptomsStart ? format(props.personData.covidEvents.SymptomsStart, "M/dd/yyyy") : "";
  const symptomsResolved = props.personData.covidEvents.SymptomsEnd ? format(props.personData.covidEvents.SymptomsEnd, "M/dd/yyyy") : "";
  const initialState = {
    name: props.personData.name,
    lastCloseContactDate,
    positiveTestDate,
    firstSymptomsDate,
    symptomsResolved,
    exposuresInHousehold: null
  };
  const [state, setState] = useState(initialState);
  const [editing, setEditing] = useState(props.personData.editing);

  const handleChange = (e: React.BaseSyntheticEvent) => {
    const target = e.target;
    setState(state => {
      return { ...state, [target.name]: target.value };
    });
  };

  const handleSubmitClick = () => {
    let covidEvents: CovidEvents = {};
    if (state.lastCloseContactDate) {
      covidEvents.LastCloseContact = parse(state.lastCloseContactDate, "M/dd/yyyy", new Date());
    }
    if (state.positiveTestDate) {
      covidEvents.PositiveTest = parse(state.positiveTestDate, "M/dd/yyyy", new Date());
    }
    if (state.firstSymptomsDate) {
      covidEvents.SymptomsStart = parse(state.firstSymptomsDate, "M/dd/yyyy", new Date());
    }

    const personData = {
      name: state.name,
      covidEvents: covidEvents,
      isNewPerson: false,
      editing: false
    };
    props.submitPersonData(personData, props.personIndex);
    setEditing(false);
  };

  return (
    <div className="f4 ba bw1 pa2">
      {props.personData.name}{" "}
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
      {editing ? (
        <div className="pa3">
          <button
            onClick={() => {
              props.handleCancelEdit();
              setEditing(false);
            }}
          >
            <span className="visually-hidden">Cancel</span>
            {props.personData.isNewPerson ? "Cancel Add" : "Cancel Edit"}
            <i aria-hidden="true" className="pl2 fas fa-times-circle gray"></i>
          </button>
          {!props.personData.isNewPerson && (
            <button
              onClick={() => {
                props.handleRemovePerson();
              }}
            >
              <span className="visually-hidden">Remove Person</span>
              Remove Person
              <i
                aria-hidden="true"
                className="pl2 fas fa-times-circle gray"
              ></i>
            </button>
          )}
          <div>
            Name:
            <input
              value={state.name}
              name="name"
              id={`${props.personIndex}-${state.name}`}
              type="text"
              onChange={handleChange}
            />
          </div>

          <div>
            When is the last date you have been exposed to someone covid
            positive outside the household?
            <input
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
          <div>
            If you have received a positive test result, what date did you take
            the test?
            <input
              value={state.positiveTestDate}
              name="positiveTestDate"
              id={`${props.personIndex}-${state.positiveTestDate}`}
              type="text"
              onChange={handleChange}
            />
          </div>
          <div>
            If you are or were showing symptoms, when did your symptoms begin?
            <input
              value={state.firstSymptomsDate}
              name="firstSymptomsDate"
              id={`${props.personIndex}-${state.firstSymptomsDate}`}
              type="text"
              onChange={handleChange}
            />
          </div>
          <button
            className="fw5 pa2 bg-green white bg-animate hover-bg-light-green"
            onClick={handleSubmitClick}
          >
            Submit Person Information
          </button>
        </div>
      ) : (
        <div className="pl3">
          {Object.entries(props.personData.covidEvents).map((entry: [string, Date] , _: number) => {
            return (
              <div className="f5">
                {entry[0]} {": "} {format(entry[1], "MM/dd/yyyy")}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
