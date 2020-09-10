import React from "react";
import { useState, none, State } from "@hookstate/core";

import {
  CovidEventName,
  InHouseExposureEvent,
  PersonData,
  colorNames,
  colors
} from "./types";
import DateQuestion from "./DateQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import InHouseExposureQuestions from "./InHouseExposureQuestions";
import { compact } from "lodash/fp";
import { isContagious } from "./util";

interface Props {
  personState: State<PersonData>;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposureEvent[]>;
  editingState: State<number | undefined>;
  eventSetterState: State<((date: string) => void) | undefined>;
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
  const datePattern = new RegExp(
    "^[0-9][0-9]?/[0-9][0-9]?/[0-9][0-9][0-9][0-9]$"
  );
  const datesInvalid: any = useState(
    Object.values(CovidEventName).reduce((d: any, key: CovidEventName) => {
      return (d[key] = false), d;
    }, {})
  );

  const datesMissing: any = useState(
    Object.values(CovidEventName).reduce((d: any, key: CovidEventName) => {
      return (d[key] = false), d;
    }, {})
  );

  const selections = selectionsState.get();
  const contagious =
    selections[CovidEventName.PositiveTest] ||
    selections[CovidEventName.SymptomsStart];

  function onCheckboxChange(fieldName: CovidEventName) {
    return (e: React.BaseSyntheticEvent) => {
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
    };
  }

  function buildCovidEventQuestion(
    fieldName: CovidEventName,
    questionText: string,
    tooltip?: JSX.Element
  ) {
    return (
      <>
        <MultipleChoiceQuestion
          id={person.id}
          questionText={questionText}
          checked={selectionsState[fieldName].get()}
          onChange={onCheckboxChange(fieldName)}
          tooltip={tooltip}
        />
        {selectionsState[fieldName].get() && (
          <DateQuestion
            id={person.id}
            questionFieldTextState={covidEventsState[fieldName]}
            questionFieldName={fieldName}
            onChange={handleChange}
            onFocus={() =>
              props.eventSetterState.set(() => (date: string) =>
                covidEventsState[fieldName].set(date)
              )
            }
            onUnfocus={() => props.eventSetterState.set(undefined)}
            missing={datesMissing[fieldName].get()}
            invalid={datesInvalid[fieldName].get()}
          />
        )}
      </>
    );
  }

  function buildSymptomsQuestion() {
    const symptomsStartState = selectionsState[CovidEventName.SymptomsStart];
    const symptomsStart = symptomsStartState.get();
    return (
      <>
        <MultipleChoiceQuestion
          id={person.id}
          questionText={"I have shown positive symptoms"}
          checked={symptomsStart}
          onChange={onCheckboxChange(CovidEventName.SymptomsStart)}
          tooltip={
            <span>
              Consult the{" "}
              <a href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html">
                CDC website
              </a>{" "}
              for a common list of symptoms of Covid{" "}
            </span>
          }
        />
        {symptomsStart ? (
          <DateQuestion
            id={person.id}
            questionFieldTextState={
              covidEventsState[CovidEventName.SymptomsStart]
            }
            questionFieldName={CovidEventName.SymptomsStart}
            onChange={handleChange}
            onFocus={() =>
              props.eventSetterState.set(() => (date: string) =>
                covidEventsState[CovidEventName.SymptomsStart].set(date)
              )
            }
            onUnfocus={() => props.eventSetterState.set(undefined)}
            missing={datesMissing[CovidEventName.SymptomsStart].get()}
            invalid={datesInvalid[CovidEventName.SymptomsStart].get()}
          />
        ) : null}
        <div className={"mb-3"} />
        {symptomsStart ? (
          <MultipleChoiceQuestion
            id={person.id}
            questionText={"My symptoms have been improved for 24 hours."}
            checked={props.personState.noSymptomsFor24Hours.get()}
            onChange={() => props.personState.noSymptomsFor24Hours.set(c => !c)}
            tooltip={
              <span>
                Improved symptoms are a requirement for you to end isolation. If
                your symptoms improve AND you have had no fever for 24 hours
                without the use of medicine, check this box.{" "}
                <a href="https://multco.us/novel-coronavirus-covid-19/if-you-test-positive-covid-19">
                  Link.
                </a>{" "}
              </span>
            }
          />
        ) : null}
      </>
    );
  }

  const handleChange = (e: React.BaseSyntheticEvent) => {
    const name: CovidEventName = e.target.name;
    const value: string = e.target.value;
    covidEventsState[name].set(value);
  };
  const handleSubmit = () => {
    Object.values(CovidEventName).map((key: CovidEventName) => {
      datesMissing[key].set(
        selectionsState.get()[key] && covidEventsState[key].get() === ""
      );
      datesInvalid[key].set(
        selectionsState.get()[key] &&
          covidEventsState[key].get() !== "" &&
          !Boolean(datePattern.exec(covidEventsState[key].get()))
      );
    });
    props.inHouseExposureEventsState.map((e: State<InHouseExposureEvent>) => {
      e.dateMissing.set(!e.ongoing.get() && e.date.get() === "");
      e.dateInvalid.set(
        !e.ongoing.get() &&
          e.date.get() !== "" &&
          !Boolean(datePattern.exec(e.date.get()))
      );
    });
    if (
      !Object.values(datesMissing.get()).includes(true) &&
      !Object.values(datesInvalid.get()).includes(true) &&
      !props.inHouseExposureEventsState
        .map((e: State<InHouseExposureEvent>) => {
          return e.dateMissing.get() || e.dateInvalid.get();
        })
        .includes(true)
    ) {
      props.editingState.set(undefined);
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
          ongoing: true,
          date: "",
          dateMissing: false,
          dateInvalid: false
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
    props.personState.set(none);
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
          <div className="mb-3">
            {buildCovidEventQuestion(
              CovidEventName.LastCloseContact,
              "I have had close contact to someone presumed covid positive (outside the household)",
              <div>
                Close contact means any of the following:
                <ul className="ph3">
                  <li>
                    You were within 6 feet of them for a total of 15 minutes or
                    more
                  </li>
                  <li>You provided care at home to the person</li>
                  <li>
                    You had direct physical contact with the person (hugged or
                    kissed them)
                  </li>
                  <li>You shared eating or drinking utensils</li>
                  <li>
                    They sneezed, coughed, or somehow got respiratory droplets
                    on you
                  </li>
                </ul>{" "}
                <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/quarantine.html">
                  Link.
                </a>
              </div>
            )}
            <hr />
          </div>
          <div className="mb-3">
            {buildCovidEventQuestion(
              CovidEventName.PositiveTest,
              "I have received a positive test result"
            )}
            <hr />
          </div>
          <div className="mb-3">
            {buildSymptomsQuestion()}
            <hr />
          </div>
          <InHouseExposureQuestions
            id={person.id}
            meaningfulInHouseExposures={meaningfulInHouseExposures}
            relevantInHouseExposureEventsState={
              relevantInHouseExposureEventsState
            }
            eventSetterState={props.eventSetterState}
          />
          <div className={"d-flex justify-content-between align-items-center"}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                removeFromMembers();
                props.editingState.set(undefined);
              }}
            >
              <span className="visually-hidden">Remove</span>
              Remove
              <i
                aria-hidden="true"
                className="pl2 fas fa-times-circle white"
              ></i>
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {person.isNewPerson ? "Submit" : "Update"}
            </button>
          </div>
        </div>
      ) : (
        <div className="card-body">
          <h4 className="d-flex justify-content-between align-items-center">
            <span className="">
              {person.name + " "}
              <i
                style={{ color: colors[person.id - (1 % colorNames.length)] }}
                className={"fa fa-xss fa-circle px-1"}
              ></i>
            </span>
            <span>
              {!editing && (
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
