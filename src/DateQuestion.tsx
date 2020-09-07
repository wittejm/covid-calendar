import React from "react";
import { State } from "@hookstate/core/dist";

interface Props {
  id: number;
  questionFieldTextState: State<string>;
  questionFieldName: string;
  onChange: (e: React.BaseSyntheticEvent) => void;
  onFocus: () => void;
  onUnfocus: () => void;
  missing: boolean;
  invalid: boolean;
}

export default function DateQuestion(props: Props) {
  const twoDigitYearPattern = new RegExp(
    "^([0-9][0-9]?/[0-9][0-9]?/)([0-9][0-9])$"
  );
  const dayMonthPattern = new RegExp("^[0-9][0-9]?/[0-9][0-9]?$");

  const handleTextChange = (e: React.BaseSyntheticEvent) => {
    props.onChange(e);
  };

  const handleUnfocus = () => {
    let fixedDate = props.questionFieldTextState.get();
    const twoDigitYearMatch = twoDigitYearPattern.exec(fixedDate);
    if (twoDigitYearMatch) {
      fixedDate = fixedDate.slice(0, -2) + "20" + fixedDate.slice(-2);
    }
    const dayMonthMatch = dayMonthPattern.exec(fixedDate);
    if (dayMonthMatch) {
      fixedDate = fixedDate + "/2020";
    }
    props.questionFieldTextState.set(fixedDate);
    props.onUnfocus();
  };
  return (
    <div className="">
      <label htmlFor={`${props.id}-${props.questionFieldName}`}>
        Date <span className="f6 fw3">mm/dd/yyyy</span>
        <div role="alert">
          {props.missing ? (
            <span className="f5 fw5 red">required</span>
          ) : props.invalid ? (
            <span className="f5 fw5 red">mm/dd/yyyy format required</span>
          ) : null}
        </div>
      </label>
      <input
        className="form-control"
        value={props.questionFieldTextState.get()}
        name={props.questionFieldName}
        id={`${props.id}-${props.questionFieldName}`}
        type="text"
        onChange={handleTextChange}
        onFocus={props.onFocus}
        onBlur={handleUnfocus}
      />
    </div>
  );
}
