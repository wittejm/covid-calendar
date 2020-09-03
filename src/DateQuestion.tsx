import React from "react";
import { State } from "@hookstate/core/dist";

interface Props {
  id: number;
  questionNumber: number;
  questionFieldTextState: State<string>;
  questionFieldName: string;
  onChange: Function;
  onFocus: Function;
  onUnfocus: Function;
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
    props.onUnfocus(props.questionFieldName);
  };

  const handleFocus = () => {
    props.onFocus(props.questionFieldName);
  };

  return (
    <div className="">
      <label htmlFor={`${props.id}-${props.questionNumber}`}>
        Date <span className="f6 fw3">mm/dd/yyyy</span>
      </label>
      <input
        className="form-control"
        value={props.questionFieldTextState.get()}
        name={props.questionFieldName}
        id={`${props.id}-${props.questionNumber}`}
        type="text"
        onChange={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleUnfocus}
      />
    </div>
  );
}
