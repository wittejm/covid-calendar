import { InHouseExposureEvent, PersonData } from "./types";
import InHouseExposureQuestion from "./InHouseExposureQuestion";
import React from "react";
import { State } from "@hookstate/core/dist";

interface Props {
  id: number;
  meaningfulInHouseExposures: PersonData[];
  relevantInHouseExposureEventsState: State<InHouseExposureEvent>[];
}

export default function InHouseExposureQuestions(props: Props) {
  return (
    <>
      {props.meaningfulInHouseExposures.map((otherPerson, index) => {
        const inHouseExposureEventState = props.relevantInHouseExposureEventsState.find(
          (eventState: State<InHouseExposureEvent>) => {
            const event = eventState.get();
            return (
              event.quarantinedPerson === otherPerson.id ||
              event.contagiousPerson === otherPerson.id
            );
          }
        );
        if (inHouseExposureEventState) {
          return (
            <InHouseExposureQuestion
              key={props.id + "-" + index}
              id={props.id}
              index={index}
              otherPerson={otherPerson}
              inHouseExposureEventState={inHouseExposureEventState}
            />
          );
        } else {
          return <></>;
        }
      })}
    </>
  );
}
