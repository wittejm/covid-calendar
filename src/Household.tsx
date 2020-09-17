import React from "react";
import { InHouseExposureEvent, PersonData } from "./types";
import Person from "./Person";
import { State } from "@hookstate/core";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import { Link } from "react-router-dom";

interface Props {
  addNewPerson: () => void;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposureEvent[]>;
  editingHouseholdState: State<boolean>;
  editingPersonState: State<number | undefined>;
  eventSetterState: State<((date: string) => void) | undefined>;
  height: State<number>;
}

export default function Household(props: Props) {
  const editingHousehold = props.editingHouseholdState.get();
  const editingPerson = props.editingPersonState.get();
  const members = props.membersState.get();
  const inHouseExposureEvents = props.inHouseExposureEventsState.get();
  const guidance = computeHouseHoldQuarantinePeriod(
    members,
    inHouseExposureEvents
  );

  function renderTitle() {
    if (editingHousehold) {
      return (
        <>
          <h2>Add your household</h2>
          <p className="lead text-muted">
            Be sure to add everyone in your household.
          </p>
        </>
      );
    } else {
      return (
        <>
          <h2>Our recommendation</h2>
          <p className="lead text-muted">
            The guidance given in this app is based on the latest CDC guidelines
            for protecting yourself and others from the spread of COVID-19. The
            same information is available on their{" "}
            <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/index.html">
              COVID-19 webpage
            </a>
            .
          </p>
        </>
      );
    }
  }

  function renderAction() {
    if (editingHousehold) {
      return (
        <button
          className="btn btn-primary my-3"
          onClick={() => props.editingHouseholdState.set(false)}
        >
          Get recommendation
        </button>
      );
    } else {
      return (
        <Link to="/">
          <button className="btn btn-primary my-3">See on calendar</button>
        </Link>
      );
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          minHeight: props.height.get() + "px"
        }}
      >
        <div className={"col-md-6"}>
          <header>
            <div className="navbar household">
              <div className="container d-flex justify-content-between">
                <div />
                <Link to="/" className={"my-2"}>
                  Close
                </Link>
              </div>
            </div>
          </header>
          <div className={"container"}>
            <div className={"my-3"} />
            {renderTitle()}
            <div>
              {props.membersState.map((personState: State<PersonData>) => {
                const person = personState.get();
                const id = person.id;
                const personGuidance = guidance.find(c => c.person.id === id);
                if (personGuidance) {
                  return (
                    <Person
                      key={id}
                      personState={personState}
                      membersState={props.membersState}
                      inHouseExposureEventsState={
                        props.inHouseExposureEventsState
                      }
                      editingHouseholdState={props.editingHouseholdState}
                      editingPersonState={props.editingPersonState}
                      eventSetterState={props.eventSetterState}
                      guidance={personGuidance}
                    />
                  );
                }
              })}
            </div>
            {!editingPerson && (
              <div
                className={"card shadow-sm mb-2"}
                onClick={() => {
                  props.editingHouseholdState.set(true);
                  props.addNewPerson();
                }}
              >
                <button className={"card-body"}>
                  <h4 className={""}>
                    Add Person &nbsp;
                    <i className="fa fa-user-plus" aria-hidden="true"></i>
                  </h4>
                </button>
              </div>
            )}
            {renderAction()}
          </div>
        </div>
        <div className={"col-md-6 empty"} />
      </div>
    </>
  );
}
