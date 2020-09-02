import React from "react";
import { InHouseExposureEvent, PersonData } from "./types";
import { set } from "lodash/fp";

interface Props {
  index: number;
  personIndex: number;
  person: PersonData;
  inHouseExposureEvent: InHouseExposureEvent;
  updateInHouseExposure: Function;
}

export default function InHouseExposureQuestion(props: Props) {
  const isExposed = props.inHouseExposureEvent.exposed;
  return (
    <div className="pa2">
      <p className="pb2">Were you exposed to {props.person.name}?</p>
      <input
        className="ml3 w4"
        checked={isExposed}
        name={`crossExposure-${props.index}-checkbox`}
        id={`crossExposure-${props.personIndex}-${props.index}-checkbox`}
        type="checkbox"
        onChange={(e: React.BaseSyntheticEvent) => {
          if (isExposed) {
            props.updateInHouseExposure(
              set("exposed", false)(props.inHouseExposureEvent)
            );
          } else {
            props.updateInHouseExposure(
              set("exposed", true)(props.inHouseExposureEvent)
            );
          }
        }}
      />
      <p className="pb2">When was your last exposure to {props.person.name}?</p>
      <input
        className="ml3 w4"
        value={props.inHouseExposureEvent.date}
        name={`crossExposure-${props.index}`}
        id={`crossExposure-${props.personIndex}-${props.index}`}
        type="text"
        onChange={(e: React.BaseSyntheticEvent) => {
          props.updateInHouseExposure(
            set("date", e.target.value)(props.inHouseExposureEvent)
          );
        }}
      />
    </div>
  );
}
