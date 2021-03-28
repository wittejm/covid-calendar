import React from "react";
import { t, jt } from 'ttag';

export default function Definitions() {

  const strongQuarantine = <strong className="our-blue">{t`quarantine`}</strong>
  const strongIsolate = <strong className="our-blue">{t`isolate`}</strong>
  return (
    <div
      className="container pb-5"
      style={{
        display: "flex",
        justifyContent: "center",
        background: "#F8F8F8",
        paddingTop: "91px",
        maxWidth: "100%"
      }}
    >
      <div
        style={{
          width: "60%",
          textAlign: "center"
        }}
      >
        <h2>{t`Quarantine vs. Isolation`}</h2>
        <div className="py-2"></div>
        <div className="row">
          <div className="col-md-6  col-sm-12 f3">
            <div
              style={{
                marginTop: "80px",
                marginBottom: "60px"
              }}
            >
              <img src={process.env.PUBLIC_URL + "/quarantine.svg"} />
            </div>
            {jt`People who must ${strongQuarantine} should avoid physical contact
            with everyone outside their home. This includes work, groceries, and socializing.`}
          </div>
          <div className="col-md-6 col-sm-12 f3">
            <div
              style={{
                marginTop: "80px",
                marginBottom: "60px"
              }}
            >
              <img src={process.env.PUBLIC_URL + "/isolation.svg"} />
            </div>
            {jt`People who must ${strongIsolate} should keep away from
            everyone inside and outside the home.`}
          </div>
        </div>
      </div>
    </div>
  )
}
