import React, { useState } from "react";

import { PersonData, CovidEvents, InHouseExposureEvent } from "./types";
import DateQuestion from "./DateQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import { parse, format } from "date-fns";
import InHouseExposureQuestions from "./InHouseExposureQuestions";
import { replace } from "./util";

interface Props {
  id: number;
  members: PersonData[];
  inHouseExposureEvents: InHouseExposureEvent[];
  setContagiousState: Function;
  setInHouseExposureEvents: Function;
  submitPersonData: Function;
  handleCancelEdit: Function;
  handleBeginEdit: Function;
  handleRemovePerson: Function;
  handleFocusDateField: Function;
  handleUnfocusDateField: Function;
  editingHousehold: boolean;
}

export default function Person(props: Props) {
  const personData = props.members.find(person => person.id === props.id);

  const lastCloseContactDate = personData?.covidEvents.LastCloseContact
    ? format(personData.covidEvents.LastCloseContact, "M/dd/yyyy")
    : "";
  const positiveTestDate = personData?.covidEvents.PositiveTest
    ? format(personData.covidEvents.PositiveTest, "M/dd/yyyy")
    : "";
  const firstSymptomsDate = personData?.covidEvents.SymptomsStart
    ? format(personData.covidEvents.SymptomsStart, "M/dd/yyyy")
    : "";
  const symptomsResolvedDate = personData?.covidEvents.SymptomsEnd
    ? format(personData.covidEvents.SymptomsEnd, "M/dd/yyyy")
    : "";

  let relevantInHouseExposureEvents = props.inHouseExposureEvents.filter(
    event =>
      event.contagiousPerson.name === personData?.name ||
      event.quarantinedPerson.name === personData?.name
  );

  const initialState: { [key: string]: any } = {
    id: personData?.id,
    name: personData?.name,
    lastCloseContactDate,
    positiveTestDate,
    firstSymptomsDate,
    symptomsResolvedDate
  };

  const [state, setState] = useState(initialState);

  const [editing, setEditing] = useState(props.editingHousehold);
  const contagious = Boolean(positiveTestDate || firstSymptomsDate);
  const [selections, setSelections] = useState(
    [
      "lastCloseContactDate",
      "positiveTestDate",
      "firstSymptomsDate",
      "symptomsResolvedDate"
    ].reduce(
      (selections: any, key) => (
        (selections[key] = state[key] !== "" ? 0 : -1), selections
      ),
      {}
    )
  );

  const buildQuestion = (
    questionNumber: number,
    personIndex: number,
    fieldName: string,
    firstQuestionText: string,
    dateQuestionText: string
  ) => {
    return (
      <div className="pa2 mb3 bg-light-gray b--green ba br2">
        <div className="flex">
          <div className="pr2"> {`${questionNumber}.`} </div>
          <MultipleChoiceQuestion
            personIndex={props.id}
            questionText={firstQuestionText}
            selected={selections[fieldName]}
            onChange={(value: number) => {
              setSelections((state: any) => {
                return { ...state, [fieldName]: value };
              });
              if (value) {
                setState(state => {
                  return { ...state, [fieldName]: "" };
                });
              }
            }}
            options={["Yes", "No"]}
          />
        </div>
        {selections[fieldName] === 0 ? (
          <DateQuestion
            personIndex={personIndex}
            questionText={firstQuestionText}
            questionFieldText={state[fieldName]}
            questionFieldName={fieldName}
            onChange={handleChange}
            onFocus={() => {
              props.handleFocusDateField(fieldName);
            }}
            onUnfocus={() => {
              props.handleUnfocusDateField(fieldName);
            }}
          />
        ) : null}
      </div>
    );
  };

  const handleChange = (e: React.BaseSyntheticEvent) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "positiveTestDate") {
      const nextContagious = Boolean(value !== "" || state.firstSymptomsDate);
      if (contagious !== nextContagious) {
        props.setContagiousState(personData, nextContagious);
      }
    } else if (name === "firstSymptomsDate") {
      const nextContagious = Boolean(value !== "" || state.positiveTestDate);
      if (contagious !== nextContagious) {
        props.setContagiousState(personData, nextContagious);
      }
    }
    setState(state => {
      return { ...state, [name]: value };
    });
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

    const personData = {
      id: state.id,
      name: state.name,
      covidEvents: covidEvents,
      isNewPerson: false,
      editing: false
    };

    setEditing(false);
    props.submitPersonData(personData, props.id);
  };

  const isContagious = Boolean(
    state.positiveTestDate || state.firstSymptomsDate
  );
  const meaningfulInHouseExposures = props.members.filter(
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
    <div className={"f4 ma2 br2 pv2 bg-washed-blue"}>
      {editing ? (
        <div className="pa3">
          <div className="pa2">
            Name:{" "}
            <input
              className="w4"
              value={state.name}
              name="name"
              id={`${props.id}-${state.name}`}
              type="text"
              onChange={handleChange}
            />
          </div>

          {buildQuestion(
            1,
            props.id,
            "lastCloseContactDate",
            "Have you been exposed to someone covid positive outside the household?",
            "When is the last date you were exposed?"
          )}
          {buildQuestion(
            2,
            props.id,
            "positiveTestDate",
            "Have you received a positive test result?",
            "What date did you take the test?"
          )}
          {buildQuestion(
            2,
            props.id,
            "firstSymptomsDate",
            "Are you showing or have you shown positive symptoms?",
            "What date did you start showing symptoms?"
          )}

          <InHouseExposureQuestions
            personIndex={props.id}
            meaningfulInHouseExposures={meaningfulInHouseExposures}
            relevantInHouseExposureEvents={relevantInHouseExposureEvents}
            updateInHouseExposure={updateInHouseExposure}
          />
          <div>
            <button
              className="fw5 pa2 bg-mid-gray white bg-animate hover-bg-silver"
              onClick={handleSubmitClick}
            >
              {personData?.isNewPerson ? "Submit" : "Update"}
            </button>
            <button
              className="ma2 fw5 pa2 bg-light-silver white bg-animate hover-bg-gray"
              onClick={() => {
                props.handleCancelEdit();
                setEditing(false);
              }}
            >
              <span className="visually-hidden">Cancel</span>
              {personData?.isNewPerson ? "Cancel Add" : "Cancel Edit"}
              <i aria-hidden="true" className="pl2 fas fa-undo white"></i>
            </button>
            {!personData?.isNewPerson && (
              <button
                className="ma2 fw5 pa2 bg-light-silver white bg-animate hover-bg-gray"
                onClick={() => {
                  props.handleRemovePerson();
                  setEditing(false);
                }}
              >
                <span className="visually-hidden">Remove</span>
                Remove
                <i
                  aria-hidden="true"
                  className="pl2 fas fa-times-circle white"
                ></i>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="pl5 fw5">
            {personData?.name + " "}

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
          </div>
        </div>
      )}
    </div>
  );
}
