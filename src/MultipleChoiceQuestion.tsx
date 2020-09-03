import React, { useState } from "react";
import { parse, format } from "date-fns";

interface Props {
  personIndex: number;
  questionText: string;
  options: string[];
  selected: number;
  onChange: Function;
}

export default function MultipleChoiceQuestion(props: Props) {
  return (
    <fieldset className="relative">
      <legend className="mb2">{props.questionText}</legend>
      <div className="radio">
        {Object.keys(props.options).map((answer: string, index: number) => {
          return (
            <div className="dib" key={index}>
              <input
                type="radio"
                id={`${props.personIndex}-${props.questionText}-${index}`}
                value={index}
                onChange={() => {
                  props.onChange(index);
                }}
                checked={index === props.selected}
              />
              <label
                htmlFor={`${props.personIndex}-${props.questionText}-${index}`}
              >
                {props.options[index]}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
