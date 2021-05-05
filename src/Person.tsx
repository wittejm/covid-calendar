import React, { Ref } from "react";
import { useState, none, State } from "@hookstate/core";
import { CovidEventName, InHouseExposure, PersonData, Guidance } from "./types";
import DateQuestion from "./DateQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import InHouseExposureQuestions from "./InHouseExposureQuestions";
import { compact } from "lodash/fp";
import { isContagious } from "./util";
import { format } from "date-fns";
import { t } from "ttag";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from "@reach/disclosure";

interface Props {
  personState: State<PersonData>;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposure[]>;
  editingHouseholdState: State<boolean>;
  guidance: Guidance;
  editingPersonRef: Ref<HTMLDivElement>;
  addNewPerson: () => void;
  recommendationDetailOpenByDefault: boolean;
  language: string;
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
  const atLeastOne =
    covidEventsState[CovidEventName.SymptomsStart].get() !== "";
  const gotPositiveTest =
    covidEventsState[CovidEventName.PositiveTest].get() !== "";
  const contagious = atLeastOne || gotPositiveTest;
  const [
    recommendationDetailIsOpen,
    setRecommendationDetailIsOpen
  ] = React.useState(props.recommendationDetailOpenByDefault);

  function commonSymptomsList() {
    return (
      <div>
        {t`Common symptoms include:`}
        <ul className="mx-3 mb-1">
          <li>{t`Fever or chills`}</li>
          <li>{t`Cough`}</li>
          <li>{t`Shortness of breath or difficulty breathing`}</li>
          <li>{t`New loss of taste or smell`}</li>
          <li>{t`Fatigue`}</li>
          <li>{t`Muscle or body aches`}</li>
          <li>{t`Headache`}</li>
          <li>{t`Sore throat`}</li>
          <li>{t`Congestion or runny nose`}</li>
          <li>{t`Nausea or vomiting`}</li>
          <li>{t`Diarrhea`}</li>
        </ul>{" "}
      </div>
    );
  }
  function onCheckboxChange(fieldName: CovidEventName) {
    return (e: React.BaseSyntheticEvent) => {
      const checked = e.target.checked;
      if (!checked) {
        covidEventsState[fieldName].set("");
      } else {
        covidEventsState[fieldName].set(format(new Date(), "MM/dd/yyyy"));
      }
      if (fieldName === CovidEventName.PositiveTest) {
        const nextContagious = Boolean(checked || atLeastOne);
        if (contagious !== nextContagious) {
          setContagiousState(nextContagious);
        }
      } else if (fieldName === CovidEventName.SymptomsStart) {
        const nextContagious = Boolean(checked || gotPositiveTest);
        if (contagious !== nextContagious) {
          setContagiousState(nextContagious);
        }
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
        {covidEventsState[fieldName].get() !== "" && (
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
    return (
      <>
        <MultipleChoiceQuestion
          id={person.id}
          questionText={t`${person.name} has been feeling sick`}
          checked={feelingSickState.get()}
          onChange={(e: React.BaseSyntheticEvent) => {
            if (feelingSickState.get()) {
              const toggleSymptomStart = onCheckboxChange(
                CovidEventName.SymptomsStart
              );
              toggleSymptomStart(e);

              feelingSickState.set(false);
              covidEventsState[CovidEventName.SymptomsStart].set("");
            } else {
              feelingSickState.set(true);
              covidEventsState[CovidEventName.SymptomsStart].set("");
            }
          }}
          tooltip={commonSymptomsList()}
        />
        {feelingSickState.get() ? (
          <>
            <DateQuestion
              id={person.id}
              promptText={t`Date of first appearance of symptoms`}
              questionFieldTextState={
                covidEventsState[CovidEventName.SymptomsStart]
              }
              questionFieldName={CovidEventName.SymptomsStart}
            />
            <div className={"mb-3"} />
            <MultipleChoiceQuestion
              id={person.id}
              questionText={t`${person.name}'s symptoms have been improved for 24 hours.`}
              checked={props.personState.noSymptomsFor24Hours.get()}
              onChange={() =>
                props.personState.noSymptomsFor24Hours.set(c => !c)
              }
              tooltip={
                <span>
                  {t`Improved symptoms are a requirement for you to end isolation. If
                  your symptoms improve AND you have had no fever for 24 hours
                  without the use of medicine, check this box.`}{" "}
                </span>
              }
            />
          </>
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
    props.membersState.map((memberState: State<PersonData>, index: number) => {
      if (memberState.get().name.match(/Person \d+/)) {
        const personNumber = index + 1;
        memberState.name.set(`Person ${personNumber}`);
      }
    });
  }

  function renderGuidance() {
    if (props.guidance.endDate) {
      const endDate = format(props.guidance.endDate, "MMM d");
      if (props.guidance.infected) {
        if (person.noSymptomsFor24Hours) {
          return t`${person.name} must isolate through ${endDate}`;
        } else {
          return t`${person.name} must isolate through at least ${endDate}`;
        }
      } else {
        if (props.guidance.peopleWithOngoingExposureWithSymptoms?.length) {
          return t`${person.name} must quarantine through at least ${endDate}`;
        } else {
          return t`${person.name} must quarantine through ${endDate}`;
        }
      }
    } else {
      return t`${person.name} should continue social distancing`;
    }
  }

  function renderGuidanceDefinition(infected: boolean, exposed: boolean) {
    return (
      <p>
        {infected
          ? t`Avoid contact with everyone, including your household.`
          : exposed
          ? t`Avoid contact with everyone outside of your household.`
          : ""}
      </p>
    );
  }

  function renderGuidanceMessage(guidance: Guidance) {
    const getTestedNote = guidance.person.feelingSick ? (
      <p>
        {" "}
        {t`Since ${guidance.person.name} is feeling sick, we recommend they get a COVID-19 test.`}
      </p>
    ) : (
      <p>
        {t`If ${guidance.person.name} develops symptoms, they should call a doctor and get a COVID-19 test.`}
        <div className="p-3">{commonSymptomsList()}</div>
      </p>
    );

    if (guidance.endDate) {
      const date = format(guidance.endDate, "PPPP");
      if (guidance.infected) {
        if (guidance.person.noSymptomsFor24Hours) {
          return (
            <p>
              {t`This is 10 days after the earliest known date of illness onset.`}
            </p>
          );
        } else {
          return (
            <>
              <p>
                {t`This is 10 days after the earliest known date of illness onset.`}
              </p>
              <p>
                {t`Additionally, continue isolating until 24 hours after fever is gone.`}
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
                {t`Please come back when symptoms for ${names} have improved for an
                exact date.`}
              </p>
              {getTestedNote}
            </>
          );
        } else {
          return (
            <>
              <p>{t`This is 14 days after the last known exposure date.`}</p>
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
          <label htmlFor={`${person.id}-name`}>
            {props.language === "en" ? "Name" : "Nombre"}
          </label>
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
                {members.length === 1 ? t`Clear` : t`Remove`}
              </button>
            </div>
          </div>
        </div>
        <MultipleChoiceQuestion
          id={person.id}
          questionText={t`${person.name} has been fully vaccinated for at least two weeks`}
          checked={props.personState.vaccinated.get()}
          onChange={() => {
            props.personState.vaccinated.set(v => !v);
            covidEventsState[CovidEventName.LastCloseContact].set("");
            setContagiousState(contagious);
          }}
        />

        <div className="mb-3">
          <hr />
          {buildCovidEventQuestion(
            CovidEventName.LastCloseContact,
            t`${person.name} had close contact to someone COVID-19 positive that does not live with them`,
            t`Date of last contact`,
            props.personState.vaccinated.get(), // disabled?
            <div>
              {t`Close contact means any of the following:`}
              <ul className="mx-3 mb-1">
                <li>
                  {t`You were within 6 feet of them for a total of 15 minutes or
                  more`}
                </li>
                <li>{t`You provided care at home to the person`}</li>
                <li>
                  {t`You had direct physical contact with the person (hugged or
                  kissed them)`}
                </li>
                <li>{t`You shared eating or drinking utensils`}</li>
                <li>
                  {t`They sneezed, coughed, or somehow got respiratory droplets on
                  you`}
                </li>
              </ul>{" "}
              <div className="pt2">
                Note: In a later question, we will ask about close contact with
                people you do live with.
              </div>
            </div>
          )}
        </div>
        <div className="mb-3">
          <hr />
          {buildCovidEventQuestion(
            CovidEventName.PositiveTest,
            t`${person.name} has received a positive test result`,
            t`Date of test`,
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
    const guidanceDefinition = renderGuidanceDefinition(
      props.guidance.infected,
      !!props.guidance.endDate
    );
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
      <Disclosure
        open={recommendationDetailIsOpen}
        onChange={() =>
          setRecommendationDetailIsOpen(!recommendationDetailIsOpen)
        }
      >
        <DisclosureButton className="w-100">
          <h4 className="d-flex justify-content-between align-items-center">
            <span className="">{renderGuidance()}</span>

            <span
              aria-hidden="true"
              className={
                "fas " +
                (recommendationDetailIsOpen ? "fa-angle-up" : "fa-angle-down")
              }
            ></span>
          </h4>
        </DisclosureButton>
        <DisclosurePanel>{renderRecommendationDetail()}</DisclosurePanel>
        <hr />
      </Disclosure>
    );
  }

  return editingHousehold ? renderEditing() : renderNonEditing();
}
