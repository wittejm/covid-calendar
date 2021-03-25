import React from "react";
import { t, jt } from 'ttag';

export default function Resources() {
  const mapLink = <div>{t`OHA’s test finder map`}</div>
  return (

    <div>
      <div>{t`I can't affort to quarantine or isolated`}</div>
      <div>{t`Help is available! Please call 211 to be connected to COVID-19 specific resources. Community based organizations can help you with food boxes, rent, and utilities. They can also help you get connected to other benefits you are eligible for.`}</div>
      <div>{t`Where do I get a test?`}</div>
      <div>{jt`You can find one using ${mapLink}.`}</div>
      <div>{t`I have additional questions but no primary care doctor`}</div>
      <div>{t`If you are a Clackamas County resident, reach out to a Clackamas County health center. To set up care or learn more about any of our health clinics call 503-655-8471.  `}</div>
      <div>{t`If you are not a resident, we recommend checking your local health centers.`}</div>
      <div>{t`Clackamas Health Centers offer care on a sliding scale to eligible uninsured and underinsured people. No one is refused care due to an inability to pay. `}</div>
    </div>
  )
}
