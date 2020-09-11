import React from "react";
import {
  CalculationResult,
  colors,
  InHouseExposureEvent,
  PersonData
} from "./types";
import Person from "./Person";
import { State } from "@hookstate/core";
import { computeHouseHoldQuarantinePeriod } from "./calculator";
import { format, isValid } from "date-fns";

interface Props {
  addNewPerson: () => void;
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposureEvent[]>;
  editingState: State<number | undefined>;
  eventSetterState: State<((date: string) => void) | undefined>;
}

export default function Household(props: Props) {
  const editing = props.editingState.get();
  const members = props.membersState.get();
  const inHouseExposureEvents = props.inHouseExposureEventsState.get();
  return (
    <>
      <div className="p-3">
        <p>
          The guidance given in this app is based on the latest CDC guidelines
          for protecting yourself and others from the spread of COVID-19. The
          same information is available on their{" "}
          <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/index.html">
            COVID-19 webpage
          </a>
          .
        </p>
        <p>
          Please add all members of your household and answer all of the
          provided questions for each.
        </p>
        <hr />
        {!editing && (
          <button className="btn btn-primary mb-2" onClick={props.addNewPerson}>
            <i className="fa fa-user-plus" aria-hidden="true"></i> Add Person
          </button>
        )}
        {props.membersState.map((personState: State<PersonData>) => {
          const person = personState.get();
          const id = person.id;
          return (
            <Person
              key={id}
              personState={personState}
              membersState={props.membersState}
              inHouseExposureEventsState={props.inHouseExposureEventsState}
              editingState={props.editingState}
              eventSetterState={props.eventSetterState}
            />
          );
        })}
        <hr />
        <div className={"p-1"}>
          <h4>Guidance</h4>
          {computeHouseHoldQuarantinePeriod(members, inHouseExposureEvents).map(
            (result: CalculationResult) => {
              if (isValid(result.startDate) && isValid(result.endDate)) {
                return (
                  <div className="p32">
                    <span className="">
                      <i
                        style={{
                          color: colors[result.person.id - (1 % colors.length)]
                        }}
                        className={"fa fa-xss fa-circle pr-1"}
                      ></i>
                      {result.person.name + " "}
                    </span>{" "}
                    {` should ${
                      result.infected ? "isolate" : "quarantine"
                    } from `}{" "}
                    {format(result.startDate, "MM/dd/yyyy")}
                    {" until "}
                    {result.person.noSymptomsFor24Hours
                      ? format(result.endDate, "MM/dd/yyyy")
                      : " 24 hours after symptoms improve"}
                    {"."}
                  </div>
                );
              }
            }
          )}
          <div className="my-2" />
          <div>
            <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/isolation.html">
              Link
            </a>{" "}
            to CDC guidelines on isolation.
          </div>
          <div className="">
            <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/quarantine.html">
              Link
            </a>{" "}
            to CDC guidelines on quarantine.
          </div>
        </div>
      </div>
    </>
  );
}
