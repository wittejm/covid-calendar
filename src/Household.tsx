import React, { useRef } from "react";
import { InHouseExposure, PersonData } from "./types";
import Person from "./Person";
import { State } from "@hookstate/core";
import { computeHouseHoldQuarantinePeriod } from "./calculator";

interface Props {
  addNewPerson: () => void;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposure[]>;
  editingHouseholdState: State<boolean>;
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

  function addPerson(e: React.BaseSyntheticEvent) {
    e.stopPropagation();
    props.editingHouseholdState.set(true);
    props.addNewPerson();
  }

  function renderTitle() {
    if (editingHousehold) {
      return (
        <>
          <h2
            style={{
              fontFamily: "Helvetica",
              fontSize: "48px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "56px",
              letterSpacing: "-0.01em",
              textAlign: "left"
            }}
          >
            Tell us about yourself and each person you live with
          </h2>
          <p
            className="lead"
            style={{
              fontFamily: "Helvetica",
              fontSize: "24px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "36px",
              letterSpacing: "0em",
              textAlign: "left",
              color: "#000000"
            }}
          >
            Thank you for doing your part to keep our community safe! For help
            with a question, tap "?"
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
          <div className="">
          <button
            className="white get-recommendation-button"
            onClick={(e: React.BaseSyntheticEvent) => {
              props.editingHouseholdState.set(false);
            }}
          >
            Get recommendation{" "}
          </button>
          </div>
        );
      } else {
        return (
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-primary my-3"
              onClick={(e: React.BaseSyntheticEvent) => {
                props.showModalState.set(false);
              }}
            >
              See on calendar{" "}
            </button>
            <button
              className="btn btn-secondary my-3"
              onClick={(e: React.BaseSyntheticEvent) => {
                props.editingHouseholdState.set(true);
              }}
            >
              Edit{" "}
            </button>
          </div>
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
                  onClick={(e: React.BaseSyntheticEvent) => {
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
                      guidance={personGuidance}
                      editingPersonRef={editingPersonRef}
                    />
                  );
                }
              })}
            </div>
            {editingHousehold && (
              <button className="mb-2" onClick={addPerson}>
                <div style={{display: "flex"}}>
                <div style={{width:"44px"}}> {/*hold the space open for no image load-time jump. There's even a teeny delay for an svg load, and that's dumb, so this stays.  */}
                <img
                  src={process.env.PUBLIC_URL + "/circle-plus.svg"}
                  style={{ marginLeft: "-0.05rem" }}
                />
                </div>
                <span className={"add-another-person"}>
                  Add another person &nbsp;
                </span>
                </div>
              </button>
            )}
            {renderAction()}
          </div>
        </div>
        <div className={"col-md-6"} />
      </div>
    </>
  );
}
