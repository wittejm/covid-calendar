import React from "react";
import { t } from 'ttag';

export default function Footer() {

  return (
    <footer
        className={"py-5"}
        style={{
          background: "#1F252F",
          position: "absolute",
          bottom: "0%",
          width: "100%",
          height: "250px"
        }}
      >
        <div
          className={"container"}
          style={{
            maxWidth: "500px",
            textAlign: "center"
          }}
        >
          <div style={{ color: "#FFFFFF" }}>
            {t`Made in partnership with Clackamas County and Code for PDX.
              Recommendations follow guidelines from the CDC.`}
          </div>
          <div className="py-3"></div>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "50px"
            }}
          >
            <span style={{ display: "inline" }}>
              <a href={"https://www.clackamas.us/publichealth"}>
                <img
                  src={process.env.PUBLIC_URL + "/logo-clackamas.png"}
                  style={{ height: "100%" }}
                />
              </a>
            </span>
            <span style={{ display: "inline-block", width: "50px" }}>
              &nbsp;
            </span>
            <span style={{ display: "inline" }}>
              <a href={"https://www.codeforpdx.org/"}>
                <img
                  src={process.env.PUBLIC_URL + "/logo-code-for-pdx.png"}
                  style={{ height: "100%" }}
                />
              </a>
            </span>
          </div>
        </div>
      </footer>
  )
}
