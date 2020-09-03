import React, { useState } from "react";

import { PersonData, CovidEvents, InHouseExposureEvent } from "./types";
import DateQuestion from "./DateQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import InHouseExposureQuestions from "./InHouseExposureQuestions";
import { none, State } from "@hookstate/core/dist";
import { compact, unset } from "lodash/fp";
import { isContagious } from "./util";

interface Props {
  index: number;
  handleFocusDateField: Function;
  handleUnfocusDateField: Function;

  personState: State<PersonData>;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposureEvent[]>;
  editingState: State<number>;
}

export default function Person(props: Props) {
  const person = props.personState.get();
  const members = props.membersState.get();
  const covidEventsState = props.personState.covidEvents;
  const editing = props.editingState.get();
  const relevantInHouseExposureEventsState: State<
    InHouseExposureEvent
  >[] = props.inHouseExposureEventsState.filter(
    (eventState: State<InHouseExposureEvent>) => {
      const event: InHouseExposureEvent = eventState.get();
      return (
        event.contagiousPerson === person.id ||
        event.quarantinedPerson === person.id
      );
    }
  );
  const relevantInHouseExposureEvents = relevantInHouseExposureEventsState.map(
    e => e.get()
  );
  const contagious = isContagious(person);
  const [selections, setSelections] = useState(
    ["LastCloseContact", "PositiveTest", "SymptomsStart", "SymptomsEnd"].reduce(
      (selections: any, key) => (
        (selections[key] = covidEventsState[key].get() !== "" ? 0 : -1),
        selections
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
      <div className="mb-3">
        <MultipleChoiceQuestion
          personIndex={person.id}
          questionText={firstQuestionText}
          selected={selections[fieldName]}
          onChange={(value: number) => {
            setSelections((state: any) => {
              return { ...state, [fieldName]: value };
            });
            if (value) {
              covidEventsState.set(events => unset(fieldName)(events));
            }
          }}
          options={["Yes", "No"]}
        />
        {selections[fieldName] === 0 ? (
          <DateQuestion
            personIndex={personIndex}
            questionText={firstQuestionText}
            questionFieldText={covidEventsState[fieldName].get()}
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
        <hr />
      </div>
    );
  };

  const handleChange = (e: React.BaseSyntheticEvent) => {
    const name = e.target.name;
    const value = e.target.value;
    const isNonEmpty = value && value !== "";
    covidEventsState[name].set(value);
    if (name === "PositiveTest") {
      const nextContagious = Boolean(
        isNonEmpty || covidEventsState.firstSymptomsDate.get()
      );
      if (contagious !== nextContagious) {
        setContagiousState(nextContagious);
      }
    } else if (name === "SymptomsStart") {
      const nextContagious = Boolean(
        isNonEmpty || covidEventsState.positiveTestDate.get()
      );
      if (contagious !== nextContagious) {
        setContagiousState(nextContagious);
      }
    }
  };

  function setContagiousState(contagious: boolean) {
    relevantInHouseExposureEventsState.map(e => e.set(none)); // Remove all current exposures
    const newExposureEvents = members.map((otherPerson: PersonData) => {
      const otherContagious = isContagious(otherPerson);
      if (person !== otherPerson && contagious !== otherContagious) {
        return {
          contagiousPerson: contagious ? person.id : otherPerson.id,
          quarantinedPerson: contagious ? otherPerson.id : person.id,
          exposed: true,
          ongoing: false,
          date: ""
        };
      }
    });
    props.inHouseExposureEventsState.merge(compact(newExposureEvents));
  }

  const meaningfulInHouseExposures = members.filter(
    (otherPerson: PersonData) => {
      const otherPersonContagious = Boolean(
        otherPerson.covidEvents.PositiveTest ||
          otherPerson.covidEvents.SymptomsStart
      );
      return person !== otherPerson && contagious !== otherPersonContagious;
    }
  );

  function removeFromMembers() {
    relevantInHouseExposureEventsState.map(e => e.set(none)); // Remove all current exposures
    props.membersState.set(membersState => [
      ...membersState.slice(0, props.index),
      ...membersState.slice(props.index + 1)
    ]);
  }

  return (
    <div className={"card shadow-sm mb-2"}>
      {props.editingState.get() === person.id ? (
        <div className="p-2">
          <div className="mb-3">
            <label htmlFor={`${person.id}-name`}>Name</label>
            <input
              className="form-control"
              value={person.name}
              name="name"
              id={`${person.id}-name`}
              type="text"
              onChange={(e: React.BaseSyntheticEvent) =>
                props.personState.name.set(e.target.value)
              }
            />
          </div>
          {buildQuestion(
            1,
            person.id,
            "LastCloseContact",
            "Have you been exposed to someone covid positive outside the household?",
            "When is the last date you were exposed?"
          )}
          {buildQuestion(
            2,
            person.id,
            "PositiveTest",
            "Have you received a positive test result?",
            "What date did you take the test?"
          )}
          {buildQuestion(
            2,
            person.id,
            "SymptomsStart",
            "Are you showing or have you shown positive symptoms?",
            "What date did you start showing symptoms?"
          )}
          <InHouseExposureQuestions
            id={person.id}
            meaningfulInHouseExposures={meaningfulInHouseExposures}
            relevantInHouseExposureEventsState={
              relevantInHouseExposureEventsState
            }
          />
          <div className={"d-flex justify-content-between align-items-center"}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                removeFromMembers();
                props.editingState.set(-1);
              }}
            >
              <span className="visually-hidden">Remove</span>
              Remove
              <i
                aria-hidden="true"
                className="pl2 fas fa-times-circle white"
              ></i>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => props.editingState.set(-1)}
            >
              {person.isNewPerson ? "Submit" : "Update"}
            </button>
          </div>
        </div>
      ) : (
        <div className="card-body">
          <h4 className="d-flex justify-content-between align-items-center mb-3">
            <span>{person.name + " "}</span>
            <span>
              {editing === -1 && (
                <button onClick={() => props.editingState.set(person.id)}>
                  <span className="visually-hidden">Edit Person</span>
                  <span aria-hidden="true" className="f5 fas fa-pen"></span>
                </button>
              )}
            </span>
          </h4>
          <div className="">
            {Object.entries(person.covidEvents).map(([name, date]) => {
              return (
                <div className="f5">
                  {name}
                  {": "} {date}
                </div>
              );
            })}
            {Object.values(relevantInHouseExposureEvents).map(
              (event: InHouseExposureEvent) => {
                if (event.exposed) {
                  const quarantinedPersonName = members.find(
                    member => member.id === event.quarantinedPerson
                  )?.name;
                  const contagiousPersonName = members.find(
                    member => member.id === event.contagiousPerson
                  )?.name;
                  return (
                    <div className="f5">
                      {quarantinedPersonName} exposed to {contagiousPersonName}{" "}
                      at {event.date}
                    </div>
                  );
                }
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}
