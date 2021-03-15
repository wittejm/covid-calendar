import React from "react";
import GridView from "./GridView";
import { InHouseExposure, PersonData } from "./types";
import { State } from "@hookstate/core/dist";
import { Link } from "react-router-dom";

interface Props {
}

export default function Home(props: Props) {
  function renderTitle() {
    return (
      <>
        <h1
          className="mb-4"
          style={{
            fontFamily: "Helvetica",
            fontSize: "3rem",
            fontStyle: "normal",
            textAlign: "center",
            color: "#1F252F"

          }}
        >
          {" "}
          Quarantine and Isolation Calculator
        </h1>
        <p className="f3 gray"> This calculator will help you determine whether to quarantine or isolate, and for how long. Answer a few simple questions and we will match your situation to the best advice according to CDC guidelines.

        </p>
        <div style={{ position: "relative", paddingBottom: "120px" }}>
          <Link className="get-started-link"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "18px 40px",
              position: "absolute",
              borderRadius: "40px",
              width: "295px",
              height: "58px",
              left: "calc(50% - 295px/2)",
              top: "50px",
              fontFamily: "Arial",
              fontStyle: "normal",
              fontWeight: "bold",
              fontSize: "14px",
              lineHeight: "160%",
              textAlign: "center",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "#FFFFFF",
              flex: "none",
              order: 0,
              flexGrow: 0,
              margin: "0px 0px"
            }}
            to="/recommendation"
          >
            Get Started
          </Link>
        </div>
      </>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      <header>
        <div className="navbar">
          <div
            className="container d-flex justify-content-between"
            style={{
              fontFamily: "Arial",
              fontStyle: "normal",
              fontWeight: "bold",
              fontSize: "14px",
              lineHeight: "160%",
              textAlign: "center",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: "#1F252F"
            }}
          >
            <div className="d-flex align-items-center">COVID CALCULATOR</div>
            <div>ESPAÑOL</div>
          </div>
        </div>
      </header>
      <main className={"main  off-black"} role={"main"} style={{ paddingBottom: "250px"}}>
        <section className={"jumbotron"} style={{ background: "#FFFFFF" }}>
          <div className="container">{renderTitle()}</div>
        </section>
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
            <h2>Quarantine vs. Isolation</h2>
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
                People who must <strong className="our-blue">quarantine</strong> are avoiding contact
                with everyone outside their home.
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
                People who must <strong className="our-blue">isolate</strong> should keep away from
                everyone inside and outside the home.
              </div>
            </div>
          </div>
        </div>
      </main>
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
          {/* contains images and below-text*/}
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
            Made in partnership between Clackamas County and Code for PDX.
            Recommendations use CDC guidelines.
          </div>
        </div>
      </footer>
    </div>
  );
}
