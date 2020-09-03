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
    <div className="mb-3">
      <div className="custom-control custom-checkbox mb-3">
        <input
          className="custom-control-input"
          checked={isExposed}
          name={`crossExposure-${props.index}-checkbox`}
          id={`crossExposure-${props.id}-${props.index}-checkbox`}
          type="checkbox"
          onChange={() => props.inHouseExposureEventState.exposed.set(v => !v)}
        />
        <label
          className="custom-control-label"
          htmlFor={`crossExposure-${props.id}-${props.index}-checkbox`}
        >
          I was exposed to {props.otherPerson.name}
        </label>
      </div>
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
    </div>
  );
}
