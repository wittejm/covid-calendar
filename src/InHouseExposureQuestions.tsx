import { InHouseExposureEvent, PersonData } from "./types";
import InHouseExposureQuestion from "./InHouseExposureQuestion";
import React from "react";

interface Props {
  personIndex: number;
  meaningfulInHouseExposures: PersonData[];
  relevantInHouseExposureEvents: InHouseExposureEvent[];
  updateInHouseExposure: Function;
}

export default function InHouseExposureQuestions(props: Props) {
  return (
    <>
      {props.meaningfulInHouseExposures.map((otherPerson, index) => {
        const inHouseExposureEvent = props.relevantInHouseExposureEvents.find(
          event =>
            event.quarantinedPerson.name === otherPerson.name ||
            event.contagiousPerson.name === otherPerson.name
        );
        if (inHouseExposureEvent) {
          return (
            <InHouseExposureQuestion
              key={index}
              index={index}
              personIndex={props.personIndex}
              person={otherPerson}
              inHouseExposureEvent={inHouseExposureEvent}
              updateInHouseExposure={props.updateInHouseExposure(
                inHouseExposureEvent
              )}
            />
          );
        } else {
          return <></>;
        }
      })}
    </>
  );
}
