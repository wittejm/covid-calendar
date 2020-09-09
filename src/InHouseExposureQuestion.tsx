import React from "react";
import { InHouseExposureEvent, PersonData } from "./types";
import { State } from "@hookstate/core/dist";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";

interface Props {
  id: number;
  index: number;
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
        questionText={`I was exposed to ${props.otherPerson.name}`}
        checked={isExposed}
        onChange={() => props.inHouseExposureEventState.exposed.set(v => !v)}
      />
      {isExposed && (
        <MultipleChoiceQuestion
          id={props.id}
          questionText={`My exposure to ${props.otherPerson.name} is ongoing`}
          checked={isOngoing}
          onChange={() => props.inHouseExposureEventState.ongoing.set(v => !v)}
        />
      )}
      {isExposed && !isOngoing && (
        <>
          <label htmlFor={`crossExposure-${props.id}-${props.index}`}>
            Date exposed to {props.otherPerson.name}{" "}
            <span className="f6 fw3">mm/dd/yyyy</span>
          </label>
          <input
            className="form-control"
            value={inHouseExposureEvent.date}
            name={`crossExposure-${props.index}`}
            id={`crossExposure-${props.id}-${props.index}`}
            type="text"
            onChange={(e: React.BaseSyntheticEvent) =>
              props.inHouseExposureEventState.date.set(e.target.value)
            }
          />
          <div role="alert">
            {props.inHouseExposureEventState.dateMissing.get() ? (
              <span className="f5 fw5 red">required</span>
            ) : props.inHouseExposureEventState.dateInvalid.get() ? (
              <span className="f5 fw5 red">mm/dd/yyyy format required</span>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
