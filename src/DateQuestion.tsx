import React, { useState } from "react";
import { parse, format } from "date-fns";

interface Props {
  personIndex: number;
  questionText: string;
  questionFieldText: string;
  questionFieldName: string;
  onChange: Function;
  onFocus: Function;
  onUnfocus: Function;
}

export default function DateQuestion(props: Props) {
  const [questionFieldText, setQuestionFieldText] = useState(
    props.questionFieldText
  );
  const twoDigitYearPattern = new RegExp(
    "^([0-9][0-9]?/[0-9][0-9]?/)([0-9][0-9])$"
  );
  const dayMonthPattern = new RegExp("^[0-9][0-9]?/[0-9][0-9]?$");

  const handleTextChange = (e: React.BaseSyntheticEvent) => {
    setQuestionFieldText(e.target.value);
    props.onChange(e);
  };

  const handleUnfocus = () => {
    console.log(
      "unfocus",
      props.questionFieldName,
      ", must autocomplete year and unhighlight cal"
    );

    let fixedDate = questionFieldText;
    const twoDigitYearMatch = twoDigitYearPattern.exec(fixedDate);
    if (twoDigitYearMatch) {
      fixedDate = fixedDate.slice(0, -2) + "20" + fixedDate.slice(-2);
    }
    const dayMonthMatch = dayMonthPattern.exec(fixedDate);
    if (dayMonthMatch) {
      fixedDate = fixedDate + "/2020";
    }
    console.log("fixed date is: ", fixedDate);
    setQuestionFieldText(fixedDate);
    props.onChange({
      target: { name: props.questionFieldName, value: fixedDate }
    });
    props.onUnfocus(props.questionFieldName);
  };

  const handleFocus = () => {
    console.log("focus", props.questionFieldName, ", must highlight cal");
    props.onFocus(props.questionFieldName);
  };

  return (
    <div className="">
      <label htmlFor={`${props.personIndex}-${props.questionText}`}>
        Date <span className="f6 fw3">mm/dd/yyyy</span>
      </label>
      <input
        className="form-control"
        value={questionFieldText}
        name={props.questionFieldName}
        id={`${props.personIndex}-${props.questionText}`}
        type="text"
        onChange={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleUnfocus}
      />
    </div>
  );
}
