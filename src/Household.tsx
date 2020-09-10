import React from "react";
import {
  CalculationResult,
  colorNames,
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
        <div className="ph4 pv3">
          The instructions given in this app are based on the latest CDC
          guidelines for protecting yourself and others from the spread of
          COVID-19. The same information is available on their{" "}
          <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/index.html">
            COVID-19 webpage.
          </a>
        </div>
        <div className="ph4 pb3">
          Please add all members of your household and answer the all of the
          provided questions for each.
        </div>
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
                          color:
                            colors[result.person.id - (1 % colorNames.length)]
                        }}
                        className={"fa fa-xss fa-circle pr-1"}
                      ></i>
                      {result.person.name + " "}
                    </span>{" "}
                    {` should ${
                      result.infected ? "isolate" : "quarantine"
                    } from `}{" "}
                    {format(result.startDate, "MM/dd/yyyy")}
                    {" until "} {format(result.endDate, "MM/dd/yyyy")}
                    {"."}
                    {result.infected && (
                      <div className="pa2">
                        If showing symptoms, continue to isolate until 24 hours
                        after symptoms improve.
                      </div>
                    )}
                  </div>
                );
              }
            }
          )}
          <div className="pa1">
            <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/isolation.html">
              CDC guidelines on isolation.
            </a>
          </div>
          <div className="ph1">
            <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/quarantine.html">
              CDC guidelines on quarantine.
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
