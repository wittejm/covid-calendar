import React, { useState } from "react";
import { parse, format } from "date-fns";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from "@reach/disclosure";

interface Props {
  id: number;
  questionText: string;
  checked: boolean;
  onChange: (e: React.BaseSyntheticEvent) => void;
  tooltip?: JSX.Element;
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
      {props.tooltip && (
        <Disclosure>
          <DisclosureButton>
            <i
              aria-hidden="true"
              className="ph2 f4 fas fa-question-circle link hover-dark-blue gray"
            ></i>
          </DisclosureButton>
          <DisclosurePanel>
            <div className="f5 pa2 gray">{props.tooltip}</div>
          </DisclosurePanel>
        </Disclosure>
      )}
    </div>
  );
}
