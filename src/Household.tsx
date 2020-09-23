import React, { useEffect, useRef } from "react";
import { InHouseExposure, PersonData } from "./types";
import Person from "./Person";
import { State } from "@hookstate/core";
import { computeHouseHoldQuarantinePeriod } from "./calculator";

interface Props {
  addNewPerson: () => void;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposure[]>;
  editingHouseholdState: State<boolean>;
  editingPersonState: State<number | undefined>;
  height: State<number>;
  showModalState: State<boolean>;
}

export default function Household(props: Props) {
  const editingHousehold = props.editingHouseholdState.get();
  const members = props.membersState.get();
  const inHouseExposureEvents = props.inHouseExposureEventsState.get();
  const guidance = computeHouseHoldQuarantinePeriod(
    members,
    inHouseExposureEvents
  );

  const editingPersonRef = useRef<HTMLDivElement>(null);
  const addPersonRef = useRef<HTMLDivElement>(null);

  function collapseEditingPerson(e: any) {
    if (editingPersonRef.current?.contains(e.target)) {
      // Within bounds of currently editing person
    } else if (addPersonRef.current?.contains(e.target)) {
      addPerson();
    } else {
      props.editingPersonState.set(undefined);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", collapseEditingPerson);
    return () => {
      document.removeEventListener("mousedown", collapseEditingPerson);
    };
  }, []);

  function addPerson() {
    props.editingHouseholdState.set(true);
    props.addNewPerson();
  }

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
    if (members.length) {
      if (editingHousehold) {
        return (
          <button
            className="btn btn-primary my-3"
            onClick={() => props.editingHouseholdState.set(false)}
          >
            Get recommendation{" "}
          </button>
        );
      } else {
        return (
          <button
            className="btn btn-primary my-3"
            onClick={() => {
              props.showModalState.set(false);
            }}
          >
            See on calendar{" "}
          </button>
        );
      }
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap"
        }}
      >
        <div
          className={"col-md-6"}
          style={{
            backgroundColor: "#fff",
            minHeight: props.height.get() + "px"
          }}
        >
          <header>
            <div className="navbar household">
              <div className="container d-flex justify-content-between">
                <div />
                <div
                  className={"my-2"}
                  onClick={() => {
                    props.showModalState.set(false);
                  }}
                >
                  Close
                </div>
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
                      guidance={personGuidance}
                      editingPersonRef={editingPersonRef}
                    />
                  );
                }
              })}
            </div>
            <div
              className={"card shadow-sm mb-2"}
              onClick={addPerson}
              ref={addPersonRef}
            >
              <button className={"card-body"}>
                <h4 className={""}>
                  Add Person &nbsp;
                  <i className="fa fa-user-plus" aria-hidden="true"></i>
                </h4>
              </button>
            </div>
            {renderAction()}
          </div>
        </div>
        <div className={"col-md-6"} />
      </div>
    </>
  );
}
