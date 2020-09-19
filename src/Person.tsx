import React, { Ref } from "react";
import { useState, none, State } from "@hookstate/core";
import { CovidEventName, InHouseExposure, PersonData, Guidance } from "./types";
import DateQuestion from "./DateQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import InHouseExposureQuestions from "./InHouseExposureQuestions";
import { compact } from "lodash/fp";
import { isContagious } from "./util";
import { format } from "date-fns";

interface Props {
  personState: State<PersonData>;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposure[]>;
  editingHouseholdState: State<boolean>;
  editingPersonState: State<number | undefined>;
  guidance: Guidance;
  editingPersonRef: Ref<HTMLDivElement>;
}

export default function Person(props: Props) {
  const person = props.personState.get();
  const members = props.membersState.get();
  const covidEventsState = props.personState.covidEvents;
  const editingPerson = props.editingPersonState.get();
  const editingHousehold = props.editingHouseholdState.get();
  const relevantInHouseExposureEventsState: State<
    InHouseExposure
  >[] = props.inHouseExposureEventsState.filter(
    (eventState: State<InHouseExposure>) => {
      const event: InHouseExposure = eventState.get();
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
      } else {
        covidEventsState[fieldName].set(format(new Date(), "MM/dd/yyyy"));
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
          questionText={`${person.name} has shown positive symptoms`}
          checked={symptomsStart}
          onChange={onCheckboxChange(CovidEventName.SymptomsStart)}
          tooltip={
            <span>
              Consult the{" "}
              <a href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html">
                CDC website
              </a>{" "}
              for a common list of symptoms of Covid.{" "}
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
          />
        ) : null}
        <div className={"mb-3"} />
        {symptomsStart ? (
          <MultipleChoiceQuestion
            id={person.id}
            questionText={`${person.name}'s symptoms have been improved for 24 hours.`}
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

  function renderGuidance() {
    if (editingHousehold) {
      return null;
    } else {
      if (props.guidance.endDate) {
        return props.guidance.infected ? " - Isolate" : " - Quarantine";
      } else {
        return null;
      }
    }
  }

  function guidanceMessage(guidance: Guidance) {
    if (guidance.endDate) {
      const date = format(guidance.endDate, "PPPP");
      if (guidance.infected) {
        if (guidance.person.noSymptomsFor24Hours) {
          return (
            <>
              <p>Until {date}</p>
              <p>
                This is 10 days after the earliest known date of illness onset.
              </p>
            </>
          );
        } else {
          return (
            <>
              <p>Until at least {date} and 24 hours after symptoms improve</p>
              <p>
                This is 10 days after the earliest known date of illness onset.
              </p>
            </>
          );
        }
      } else {
        if (guidance.peopleWithOngoingExposureWithSymptoms?.length) {
          const names = guidance.peopleWithOngoingExposureWithSymptoms?.join(
            ", "
          );
          return (
            <>
              <p>
                Until 14 days after isolation period ends for {names} (at least{" "}
                {date})
              </p>
              <p>
                Please come back when symptoms for {names} have improved for an
                exact date.
              </p>
            </>
          );
        } else {
          return (
            <>
              <p>Until {date}</p>
              <p>This is 14 days after the last known exposure date.</p>
            </>
          );
        }
      }
    }
  }

  function renderFeedbackLine(name: string, date: string, noSymptoms: boolean) {
    switch (name) {
      case CovidEventName.LastCloseContact:
        return `Most recent close contact was on ${date}.`;
      case CovidEventName.PositiveTest:
        return `Earliest positive test was on ${date}.`;
      case CovidEventName.SymptomsStart:
        if (noSymptoms) {
          return `Symptoms started showing on ${date}.`;
        } else {
          return `Symptoms started showing on ${date} and have not improved.`;
        }
      default:
        return null;
    }
  }

  function renderFeedback() {
    return (
      <div className="">
        {Object.entries(person.covidEvents).map(
          ([name, date]: [string, string]) => {
            if (date !== "") {
              return (
                <div className="f5">
                  {renderFeedbackLine(name, date, person.noSymptomsFor24Hours)}
                </div>
              );
            }
          }
        )}
        {Object.values(relevantInHouseExposureEvents).map(
          (event: InHouseExposure) => {
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
                    {contagiousPersonName}.
                  </div>
                );
              } else {
                return (
                  <div className="f5">
                    {quarantinedPersonName} exposed to {contagiousPersonName} at{" "}
                    {event.date}.
                  </div>
                );
              }
            }
          }
        )}
      </div>
    );
  }

  function renderEditing() {
    return (
      <div className={"card shadow-sm mb-2"} ref={props.editingPersonRef}>
        <div className="card-body">
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
              `${person.name} has had close contact to someone presumed covid positive (outside the household)`,
              <div>
                Close contact means any of the following:
                <ul className="mx-3 mb-1">
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
          </div>
          <div className="mb-3">
            <hr />
            {buildCovidEventQuestion(
              CovidEventName.PositiveTest,
              `${person.name} has received a positive test result`
            )}
          </div>
          <div className="mb-3">
            <hr />
            {buildSymptomsQuestion()}
          </div>
          <InHouseExposureQuestions
            person={person}
            meaningfulInHouseExposures={meaningfulInHouseExposures}
            relevantInHouseExposureEventsState={
              relevantInHouseExposureEventsState
            }
          />
        </div>
      </div>
    );
  }

  function renderNonEditing() {
    return (
      <div className={"card shadow-sm mb-2"}>
        <div className="card-body">
          <div className={""}>
            <h4 className="d-flex justify-content-between align-items-center">
              <span className="">
                {person.name + ""}
                {renderGuidance()}
              </span>
              <span>
                {!editingPerson && (
                  <>
                    <button
                      onClick={() => {
                        props.editingHouseholdState.set(true);
                        props.editingPersonState.set(person.id);
                      }}
                    >
                      <span className="visually-hidden">Edit Person</span>
                      <span aria-hidden="true" className="f5 fas fa-pen"></span>
                    </button>
                    <span className={"mx-2"} />
                    <button
                      onClick={() => {
                        removeFromMembers();
                        props.editingPersonState.set(undefined);
                      }}
                    >
                      <span className="visually-hidden">Remove</span>
                      <span
                        className="f5 fa fa-trash"
                        aria-hidden="true"
                      ></span>
                    </button>
                  </>
                )}
              </span>
            </h4>
            {!editingHousehold && guidanceMessage(props.guidance)}
          </div>
          <div className={"my-3"} />
          {editingHousehold && renderFeedback()}
        </div>
      </div>
    );
  }

  return editingPerson === person.id ? renderEditing() : renderNonEditing();
}
