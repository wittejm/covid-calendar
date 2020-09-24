import React from "react";
import DatePicker from "react-datepicker";
import { State } from "@hookstate/core";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format, isValid } from "date-fns";
interface Props {
  id: number;
  promptText: string;
  questionFieldTextState: State<string>;
  questionFieldName: string;
}

export default function DateQuestion(props: Props) {
  const questionFieldText = props.questionFieldTextState.get();
  const parsedDate = parse(questionFieldText, "M/dd/yyyy", new Date());
  const questionFieldDate = isValid(parsedDate) ? parsedDate : new Date();

  return (
    <div className="">
      <label htmlFor={`${props.id}-${props.questionFieldName}`}>
        {props.promptText} <span className="f6 fw3">mm/dd/yyyy</span>
      </label>
      <DatePicker
        className="form-control"
        selected={questionFieldDate}
        onChange={(date: Date) => {
          const validDate = isValid(date) ? date : new Date(); // Default to today
          props.questionFieldTextState.set(format(validDate, "MM/dd/yyyy"));
        }}
        name={props.questionFieldName}
        id={`${props.id}-${props.questionFieldName}`}
      />
    </div>
  );
}
