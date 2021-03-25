import React from "react";
import { t, jt } from 'ttag';

export default function Instructions() {
  return (

    <div>
      <div>{t`How to use this tool`}</div>
      <div>{t`STEP 1`}</div>
      <div>{t`For each person you live with, answer questions about their symptoms.`}</div>
      <div>{t`STEP 2`}</div>
      <div>{t`After inputting your answers, you’ll receive recommendations on what each person should do to stay safe based on official CDC guidelines.`}</div>
      <div>{t`STEP 3`}</div>
      <div>{t`Tap on a recommendation to learn more about the safety behind it.`}</div>
    </div>
  )
}
