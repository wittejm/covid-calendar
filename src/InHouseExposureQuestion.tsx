import React from "react";
import { InHouseExposureEvent, PersonData } from "./types";
import { State } from "@hookstate/core/dist";

interface Props {
  id: number;
  index: number;
  otherPerson: PersonData;
  inHouseExposureEventState: State<InHouseExposureEvent>;
}

export default function InHouseExposureQuestion(props: Props) {
  const inHouseExposureEvent = props.inHouseExposureEventState.get();
  const isExposed = inHouseExposureEvent.exposed;
  return (
    <div className="pa2">
      <p className="pb2">Were you exposed to {props.otherPerson.name}?</p>
      <input
        className="ml3 w4"
        checked={isExposed}
        name={`crossExposure-${props.index}-checkbox`}
        id={`crossExposure-${props.id}-${props.index}-checkbox`}
        type="checkbox"
        onChange={() => props.inHouseExposureEventState.exposed.set(v => !v)}
      />
      <p className="pb2">
        When was your last exposure to {props.otherPerson.name}?
      </p>
      <input
        className="ml3 w4"
        value={inHouseExposureEvent.date}
        name={`crossExposure-${props.index}`}
        id={`crossExposure-${props.id}-${props.index}`}
        type="text"
        onChange={(e: React.BaseSyntheticEvent) =>
          props.inHouseExposureEventState.date.set(e.target.value)
        }
      />
    </div>
  );
}
