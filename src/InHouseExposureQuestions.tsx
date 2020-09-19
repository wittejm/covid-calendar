import { InHouseExposure, PersonData } from "./types";
import InHouseExposureQuestion from "./InHouseExposureQuestion";
import React from "react";
import { State } from "@hookstate/core/dist";

interface Props {
  person: PersonData;
  meaningfulInHouseExposures: PersonData[];
  relevantInHouseExposureEventsState: State<InHouseExposure>[];
}

export default function InHouseExposureQuestions(props: Props) {
  return (
    <>
      {props.meaningfulInHouseExposures.map((otherPerson, index) => {
        const inHouseExposureEventState = props.relevantInHouseExposureEventsState.find(
          (eventState: State<InHouseExposure>) => {
            const event = eventState.get();
            return (
              event.quarantinedPerson === otherPerson.id ||
              event.contagiousPerson === otherPerson.id
            );
          }
        );
        if (inHouseExposureEventState) {
          return (
            <>
              <hr />
              <InHouseExposureQuestion
                key={props.person.id + "-" + index}
                id={props.person.id}
                index={index}
                person={props.person}
                otherPerson={otherPerson}
                inHouseExposureEventState={inHouseExposureEventState}
              />
            </>
          );
        } else {
          return <></>;
        }
      })}
    </>
  );
}
