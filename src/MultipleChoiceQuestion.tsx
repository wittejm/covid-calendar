import React, { useState } from "react";
import { parse, format } from "date-fns";

interface Props {
  id: number;
  questionText: string;
  checked: boolean;
  onChange: (e: React.BaseSyntheticEvent) => void;
}

export default function MultipleChoiceQuestion(props: Props) {
  return (
    <div className="custom-control custom-checkbox mb-3">
      <input
        className="custom-control-input"
        checked={props.checked}
        id={`checkbox-${props.id}-${props.questionText}`}
        type="checkbox"
        onChange={props.onChange}
      />
      <label
        className="custom-control-label"
        htmlFor={`checkbox-${props.id}-${props.questionText}`}
      >
        {props.questionText}
      </label>
    </div>
  );
}
