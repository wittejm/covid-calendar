import React from "react";
import { InHouseExposure, PersonData } from "./types";
import { State } from "@hookstate/core";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";
import DateQuestion from "./DateQuestion";
import { format } from "date-fns";
import { t } from 'ttag';

interface Props {
  id: number;
  index: number;
  person: PersonData;
  otherPerson: PersonData;
  inHouseExposureEventState: State<InHouseExposure>;
}

export default function InHouseExposureQuestion(props: Props) {
  const inHouseExposureEvent = props.inHouseExposureEventState.get();
  const isExposed = inHouseExposureEvent.exposed;
  const isOngoing = inHouseExposureEvent.ongoing;
  return (
    <div className="mb-3">
      <MultipleChoiceQuestion
        id={props.id}
        questionText={t`${props.person.name} had close contact with ${props.otherPerson.name}`}
        checked={isExposed}
        onChange={() => props.inHouseExposureEventState.exposed.set(v => !v)}
      />
      {isExposed && (
        <MultipleChoiceQuestion
          id={props.id}
          questionText={t`${props.person.name}'s close contact with ${props.otherPerson.name} is ongoing`}
          checked={isOngoing}
          onChange={() => {
            const ongoingState = props.inHouseExposureEventState.ongoing;
            const ongoing = ongoingState.get();
            const newOngoing = !ongoing;
            ongoingState.set(newOngoing);
            if (newOngoing) {
              props.inHouseExposureEventState.date.set("");
            } else {
              props.inHouseExposureEventState.date.set(
                format(new Date(), "MM/dd/yyyy")
              );
            }
          }}
        />
      )}
      {isExposed && !isOngoing && (
        <DateQuestion
          id={props.id}
          promptText={t`Date of last contact`}
          questionFieldTextState={props.inHouseExposureEventState.date}
          questionFieldName={`crossExposure-${props.index}`}
        />
      )}
    </div>
  );
}
