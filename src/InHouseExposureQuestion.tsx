import React from "react";
import { InHouseExposureEvent, PersonData } from "./types";
import { State } from "@hookstate/core/dist";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import DateQuestion from "./DateQuestion";

interface Props {
  id: number;
  index: number;
  person: PersonData;
  otherPerson: PersonData;
  inHouseExposureEventState: State<InHouseExposureEvent>;
}

export default function InHouseExposureQuestion(props: Props) {
  const inHouseExposureEvent = props.inHouseExposureEventState.get();
  const isExposed = inHouseExposureEvent.exposed;
  const isOngoing = inHouseExposureEvent.ongoing;
  return (
    <div className="mb-3">
      <MultipleChoiceQuestion
        id={props.id}
        questionText={`${props.person.name} had close contact with ${props.otherPerson.name}`}
        checked={isExposed}
        onChange={() => props.inHouseExposureEventState.exposed.set(v => !v)}
      />
      {isExposed && (
        <MultipleChoiceQuestion
          id={props.id}
          questionText={`${props.person.name}'s close contact with ${props.otherPerson.name} is ongoing`}
          checked={isOngoing}
          onChange={() => props.inHouseExposureEventState.ongoing.set(v => !v)}
        />
      )}
      {isExposed && !isOngoing && (
        <DateQuestion
          id={props.id}
          questionFieldTextState={props.inHouseExposureEventState.date}
          questionFieldName={`crossExposure-${props.index}`}
          missing={inHouseExposureEvent.dateMissing}
          invalid={inHouseExposureEvent.dateInvalid}
        />
      )}
    </div>
  );
}
