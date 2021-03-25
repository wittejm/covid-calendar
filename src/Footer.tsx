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
            width: "400px"
          }}
        >
          {" "}
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
            <span
              style={{
                display: "inline",
                height: "1px",
                width: "56.1px",
                opacity: 0.5,
                border: "1px solid #FFFFFF",
                transform: "rotate(120.37deg)",
                position: "absolute",
                left: "19.51%",
                top: "50.6%"
              }}
            ></span>
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
          <div className="py-3"></div>
          <div style={{ color: "#FFFFFF" }}>
            {t`Made in partnership with Clackamas County and Code for PDX.
              Recommendations use CDC guidelines.`}
          </div>
        </div>
      </footer>
  )
}
