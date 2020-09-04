import React from "react";
import { useState } from "@hookstate/core";

import { CovidEventName, InHouseExposureEvent, PersonData } from "./types";
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
  const selectionsState: any = useState(
    Object.values(CovidEventName).reduce(
      (selections: any, key: CovidEventName) => (
        (selections[key] = covidEventsState[key].get() !== ""), selections
      ),
      {}
    )
  );
  const selections = selectionsState.get();
  const contagious =
    selections[CovidEventName.PositiveTest] ||
    selections[CovidEventName.SymptomsStart];

  const buildQuestion = (
    questionNumber: number,
    fieldName: CovidEventName,
    firstQuestionText: string
  ) => {
    return (
      <div className="mb-3">
        <MultipleChoiceQuestion
          id={person.id}
          questionText={firstQuestionText}
          checked={selectionsState[fieldName].get()}
          onChange={(e: React.BaseSyntheticEvent) => {
            const checked = e.target.checked;
            selectionsState[fieldName].set(checked);
            if (fieldName === CovidEventName.PositiveTest) {
              const nextContagious = Boolean(
                checked || selections[CovidEventName.SymptomsStart]
              );
              if (contagious !== nextContagious) {
                setContagiousState(nextContagious);
              }
            } else if (fieldName === CovidEventName.SymptomsStart) {
              const nextContagious = Boolean(
                checked || selections[CovidEventName.PositiveTest]
              );
              if (contagious !== nextContagious) {
                setContagiousState(nextContagious);
              }
            }
            if (!checked) {
              covidEventsState[fieldName].set("");
            }
          }}
        />
        {selectionsState[fieldName].get() ? (
          <DateQuestion
            id={person.id}
            questionNumber={questionNumber}
            questionFieldTextState={covidEventsState[fieldName]}
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
    const name: CovidEventName = e.target.name;
    const value: string = e.target.value;
    covidEventsState[name].set(value);
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
          ongoing: true,
          date: ""
        };
      }
    });
    props.inHouseExposureEventsState.merge(compact(newExposureEvents));
  }

  const meaningfulInHouseExposures = members.filter(
    (otherPerson: PersonData) =>
      person !== otherPerson && contagious !== isContagious(otherPerson)
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
            CovidEventName.LastCloseContact,
            "I have been exposed to someone covid positive (outside the household)"
          )}
          {buildQuestion(
            2,
            CovidEventName.PositiveTest,
            "I have received a positive test result"
          )}
          {buildQuestion(
            2,
            CovidEventName.SymptomsStart,
            "I have shown positive symptoms"
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
            {Object.entries(person.covidEvents).map(
              ([name, date]: [string, string]) => {
                if (date !== "") {
                  return (
                    <div className="f5">
                      {name}
                      {": "} {date}
                    </div>
                  );
                }
              }
            )}
            {Object.values(relevantInHouseExposureEvents).map(
              (event: InHouseExposureEvent) => {
                if (event.exposed) {
                  const quarantinedPersonName = members.find(
                    member => member.id === event.quarantinedPerson
                  )?.name;
                  const contagiousPersonName = members.find(
                    member => member.id === event.contagiousPerson
                  )?.name;
                  if (event.ongoing) {
                    return (
                      <div className="f5">
                        {quarantinedPersonName} has an ongoing exposure to{" "}
                        {contagiousPersonName}{" "}
                      </div>
                    );
                  } else {
                    return (
                      <div className="f5">
                        {quarantinedPersonName} exposed to{" "}
                        {contagiousPersonName} at {event.date}
                      </div>
                    );
                  }
                }
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}
