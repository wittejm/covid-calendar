import React from "react";
import GridView from "./GridView";
import { InHouseExposure, PersonData } from "./types";
import { State } from "@hookstate/core/dist";

interface Props {
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposure[]>;
  showModalState: State<boolean>;
}

export default function Home(props: Props) {
  const members = props.membersState.get();

  function renderTitle() {
    if (members.length) {
      return (
        <>
          <h1>Here is our recommendation for your household</h1>
          <p className="lead text-muted">
            The guidance given in this app is based on the latest CDC guidelines
            for protecting yourself and others from the spread of COVID-19. The
            same information is available on their{" "}
            <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/index.html">
              COVID-19 webpage
            </a>
            .
          </p>
          <div
            className="btn btn-primary my-2"
            onClick={() => {
              props.showModalState.set(true);
            }}
          >
            Edit Answers
          </div>
        </>
      );
    } else {
      return (
        <>
          <h1>Get quarantine and isolation guidance for your household</h1>
          <p className="lead text-muted">
            We'll let you know who should quarantine or isolate, and for how
            long.
          </p>
          <div
            className="btn btn-primary my-2"
            onClick={() => {
              props.showModalState.set(true);
            }}
          >
            Get Started
          </div>
        </>
      );
    }
  }

  return (
    <div style={{ position: "relative", minHeight: "100%" }}>
      <header>
        <div className="navbar">
          <div className="container d-flex justify-content-between">
            <div className="navbar-brand d-flex align-items-center">
              COVID Quarantine Calculator (Alpha)
            </div>
            <div>English</div>
          </div>
        </div>
      </header>
      <main className={"main"} role={"main"} style={{ paddingBottom: "250px" }}>
        <section className={"jumbotron"}>
          <div className="container">{renderTitle()}</div>
        </section>
        <div
          className="container pb-5"
          style={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              width: "70%"
            }}
          >
            <h2 style={{ textAlign: "center" }}>Quarantine vs. Isolation</h2>
            <div className="py-2"></div>
            <div className="row">
              <div className="col-md-6  col-sm-12">
                People who must <strong>quarantine</strong> are avoiding contact
                with everyone outside their home.
              </div>
              <div className="col-md-6 col-sm-12">
                People who must <strong>isolate</strong> should keep away from
                everyone inside and outside the home.
              </div>
            </div>
          </div>
        </div>
        {members.length ? (
          <GridView
            membersState={props.membersState}
            inHouseExposureEvents={props.inHouseExposureEventsState.get()}
          />
        ) : null}
      </main>

      {/*
      <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/isolation.html">
        CDC guidelines on isolation
      </a>
      <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/quarantine.html">
        CDC guidelines on quarantine
      </a>
      */}
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
