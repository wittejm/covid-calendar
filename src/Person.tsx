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
  guidance: Guidance;
  editingPersonRef: Ref<HTMLDivElement>;
  addNewPerson: () => void;
}

export default function Person(props: Props) {
  const person = props.personState.get();
  const members = props.membersState.get();
  const covidEventsState = props.personState.covidEvents;
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
  const atLeastOne = covidEventsState[CovidEventName.SymptomsStart].get() !== "";
  const gotPositiveTest = covidEventsState[CovidEventName.PositiveTest].get() !== "";
  const contagious = atLeastOne || gotPositiveTest;

  function onCheckboxChange(fieldName: CovidEventName) {
    return (e: React.BaseSyntheticEvent) => {
      const checked = e.target.checked;
      if (!checked) {
        covidEventsState[fieldName].set("");
      } else {
        covidEventsState[fieldName].set(format(new Date(), "MM/dd/yyyy"));
      }
      if (fieldName === CovidEventName.PositiveTest) {
        const nextContagious = Boolean(
          checked || atLeastOne
        );
        if (contagious !== nextContagious) {
          setContagiousState(nextContagious);
        }
      } else if (fieldName === CovidEventName.SymptomsStart) {
        const nextContagious = Boolean(
          checked || gotPositiveTest
        );
        if (contagious !== nextContagious) {
          setContagiousState(nextContagious);
        }
      }
    };
  }

  function onSymptomCheckboxChange(index: number) {
    return (e: React.BaseSyntheticEvent) => {
      const symptomsCheckedState = props.personState.symptomsChecked;
      const anyCheckedBefore = symptomsCheckedState
        .get()
        .some(val=>val);
      symptomsCheckedState[index].set(c => !c);
      const anyCheckedAfter = symptomsCheckedState
        .get()
        .some(val=>val);
      if (
        !anyCheckedBefore || !anyCheckedAfter
      ) {
        const toggleSymptomStart = onCheckboxChange(
          CovidEventName.SymptomsStart
        );
        toggleSymptomStart(e);
      } else {
      }
    };
  }

  function buildCovidEventQuestion(
    fieldName: CovidEventName,
    questionText: string,
    datePromptText: string,
    disabled: boolean,
    tooltip?: JSX.Element
  ) {
    return (
      <>
        <MultipleChoiceQuestion
          id={person.id}
          questionText={questionText}
          checked={covidEventsState[fieldName].get() !== ""}
          onChange={onCheckboxChange(fieldName)}
          tooltip={tooltip}
          disabled={disabled}
        />
        {(covidEventsState[fieldName].get() !== "") && (
          <DateQuestion
            id={person.id}
            promptText={datePromptText}
            questionFieldTextState={covidEventsState[fieldName]}
            questionFieldName={fieldName}
          />
        )}
      </>
    );
  }

  function buildSymptomsQuestion() {
    const feelingSickState = props.personState.feelingSick;
    const symptomsChecked = props.personState.symptomsChecked;
    return (
      <>
        <MultipleChoiceQuestion
          id={person.id}
          questionText={`${person.name} has been feeling sick`}
          checked={feelingSickState.get()}
          onChange={(e : React.BaseSyntheticEvent) => {
            if (feelingSickState.get()){
              if (atLeastOne) {
                const toggleSymptomStart = onCheckboxChange(
                  CovidEventName.SymptomsStart
                );
                toggleSymptomStart(e);
              }

              feelingSickState.set(false);
              covidEventsState[CovidEventName.SymptomsStart].set("");
              symptomsChecked.set([false, false, false, false]);
            } else {
              feelingSickState.set(true);
              covidEventsState[CovidEventName.SymptomsStart].set("");
              symptomsChecked.set([false, false, false, false]);
            }
          }}
          tooltip={
            <div>
              Common symptoms include:
              <ul className="mx-3 mb-1">
                <li>Fever or chills</li>
                <li>Cough</li>
                <li>Shortness of breath or difficulty breathing</li>
                <li>Fatigue</li>
                <li>Muscle or body aches</li>
                <li>Headache</li>
                <li>New loss of taste or smell</li>
                <li>Sore throat</li>
                <li>Congestion or runny nose</li>
                <li>Nausea or vomiting</li>
                <li>Diarrhea</li>
              </ul>{" "}
              <a href="https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html">
                Link.
              </a>
            </div>
          }
        />
        {feelingSickState.get() ? (
          <div className="questionnaire-text subquestion">
            <div className="mb-3">Check the boxes if you are experiencing:</div>

            <MultipleChoiceQuestion
              id={person.id}
              questionText={`Fever`}
              checked={symptomsChecked[0].get()}
              onChange={e => onSymptomCheckboxChange(0)(e)}
            />
            <MultipleChoiceQuestion
              id={person.id}
              questionText={`Cough`}
              checked={symptomsChecked[1].get()}
              onChange={e => onSymptomCheckboxChange(1)(e)}
            />
            <MultipleChoiceQuestion
              id={person.id}
              questionText={`Shortness of breath`}
              checked={symptomsChecked[2].get()}
              onChange={e => onSymptomCheckboxChange(2)(e)}
            />
            <MultipleChoiceQuestion
              id={person.id}
              questionText={`New loss of taste or smell`}
              checked={symptomsChecked[3].get()}
              onChange={e => onSymptomCheckboxChange(3)(e)}
            />
          </div>
        ) : null}
        {atLeastOne ? (
          <DateQuestion
            id={person.id}
            promptText="Date of first appearance of symptoms"
            questionFieldTextState={
              covidEventsState[CovidEventName.SymptomsStart]
            }
            questionFieldName={CovidEventName.SymptomsStart}
          />
        ) : null}
        <div className={"mb-3"} />
        {atLeastOne ? (
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
    relevantInHouseExposureEventsState.reverse().map(e => e.set(none)); // Remove all current exposures
    const newExposureEvents = members.map((otherPerson: PersonData) => {
      const otherContagious = isContagious(otherPerson);
      if (person.id !== otherPerson.id && contagious !== otherContagious) {
        const theAtRiskPerson = contagious ? otherPerson : person;
        if (!theAtRiskPerson.vaccinated) {
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
      }
    });
    props.inHouseExposureEventsState.merge(compact(newExposureEvents));
  }

  const meaningfulInHouseExposures = members.filter(
    (otherPerson: PersonData) =>
      person !== otherPerson && contagious !== isContagious(otherPerson)
  );

  function removeFromMembers() {
    relevantInHouseExposureEventsState.reverse().map(e => e.set(none)); // Remove all current exposures
    props.personState.set(none);
    props.membersState.map((memberState: State<PersonData>, index: number)=>{
      if (memberState.get().name.match(/Person \d+/)){
        memberState.name.set(`Person ${index+1}`);
      }
    })

  }

  function renderGuidance() {
    if (props.guidance.endDate) {
      if (props.guidance.infected) {
        if (person.noSymptomsFor24Hours) {
          return `${person.name} must isolate until ${format(props.guidance.endDate, "MMM d")}`;
        } else {
          return `${person.name} must isolate until at least ${format(props.guidance.endDate, "MMM d")}`;
        }
      } else {
        if (props.guidance.peopleWithOngoingExposureWithSymptoms?.length) {
          return `${person.name} must quarantine until at least ${format(props.guidance.endDate, "MMM d")}`;
        } else {
          return `${person.name} must quarantine until ${format(props.guidance.endDate, "MMM d")}`;
        }
      }
    } else {
      return `${person.name} should continue social distancing`;
    }
  }

  function renderGuidanceDefinition(infected: boolean, exposed : boolean) {
    return (
      <p>
        {infected
          ? "Avoid contact with everyone, including your household."
          : exposed
            ? "Avoid contact with everyone outside of your household."
            : ""
        }
      </p>
    );
  }

  function renderGuidanceMessage(guidance: Guidance) {

    const getTestedNote = guidance.person.feelingSick ? (
      <p>
        {" "}
        Since {guidance.person.name} is feeling sick, we recommend they get a covid test.
      </p>
    ) :
    (
      <p>
        If {guidance.person.name} develops symptoms, they should call a doctor and get a covid test.
      </p>
    );

    if (guidance.endDate) {
      const date = format(guidance.endDate, "PPPP");
      if (guidance.infected) {
        if (guidance.person.noSymptomsFor24Hours) {
          return (
            <p>
              This is 10 days after the earliest known date of illness onset.
            </p>
          );
        } else {
          return (
            <>
              <p>
                This is 10 days after the earliest known date of illness onset.
              </p>
              <p>
                Additionally, continue isolating until 24 hours after fever is gone.
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
                Please come back when symptoms for {names} have improved for an
                exact date.
              </p>
              {getTestedNote}
            </>
          );
        } else {
          return (
            <>
              <p>This is 14 days after the last known exposure date.</p>
              {getTestedNote}
            </>
          );
        }
      }
    } else {
      return getTestedNote;
    }
  }

  function renderEditing() {
    return (
      <div className="ml2 mb5">
        <div className="mb-3">
          <label htmlFor={`${person.id}-name`}>Name</label>
          <div className="input-group">
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
            <div className="input-group-append">
              <button
                className="btn btn-secondary"
                onClick={(e: React.BaseSyntheticEvent) => {
                  e.stopPropagation();
                  removeFromMembers();
                  if (members.length === 0) {
                    props.addNewPerson();
                  }
                }}
              >
                { members.length === 1 ? "Clear" : "Remove" }
              </button>
            </div>
          </div>
        </div>
        <MultipleChoiceQuestion
          id={person.id}
          questionText={`${person.name} has been fully vaccinated for at least two weeks`}
          checked={props.personState.vaccinated.get()}
          onChange={() => {
            props.personState.vaccinated.set(v => !v);
            covidEventsState[CovidEventName.LastCloseContact].set("");
            setContagiousState(contagious);
          }}
        />

        <div className="mb-3">
          {buildCovidEventQuestion(
            CovidEventName.LastCloseContact,
            `${person.name} had close contact to someone COVID positive that does not live with them`,
            "Date of last contact",
            props.personState.vaccinated.get(), // disabled?
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
                  They sneezed, coughed, or somehow got respiratory droplets on
                  you
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
            `${person.name} has received a positive test result`,
            "Date of test",
            false // disabled?
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
    );
  }

  function renderRecommendationDetail() {
    const guidanceDefinition = renderGuidanceDefinition(props.guidance.infected, !!props.guidance.endDate);
    const guidanceMessage = renderGuidanceMessage(props.guidance);
    if (guidanceDefinition && guidanceMessage) {
      return (
        <div className="recommendation-detail">
          {guidanceDefinition}
          {guidanceMessage}
        </div>
      );
    }
  }

  function renderNonEditing() {
    return (
      <div className="">
        <h4 className="d-flex justify-content-between align-items-center">
          <span className="">
            {renderGuidance()}
          </span>
        </h4>
        {renderRecommendationDetail()}
      <hr/>
      </div>
    );
  }

  return editingHousehold ? renderEditing() : renderNonEditing();
}
