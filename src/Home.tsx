import React from "react";
import GridView from "./GridView";
import { Link } from "react-router-dom";
import { InHouseExposure, PersonData } from "./types";
import { State } from "@hookstate/core/dist";

interface Props {
  membersState: State<PersonData[]>;
  inHouseExposureEventsState: State<InHouseExposure[]>;
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
          <p>
            <Link to="/household" className="btn btn-primary my-2">
              Edit Answers
            </Link>
          </p>
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
          <p>
            <Link to="/household" className="btn btn-primary my-2">
              Get Started
            </Link>
          </p>
        </>
      );
    }
  }

  return (
    <>
      <header>
        <div className="navbar">
          <div className="container d-flex justify-content-between">
            <div className="navbar-brand d-flex align-items-center">
              COVID Quarantine Calculator (Work in Progress)
            </div>
            <div>English</div>
          </div>
        </div>
      </header>
      <main className={"main"} role={"main"}>
        <section className={"jumbotron"}>
          <div className="container">{renderTitle()}</div>
        </section>
      </main>
      {members.length ? (
        <GridView
          membersState={props.membersState}
          inHouseExposureEvents={props.inHouseExposureEventsState.get()}
        />
      ) : null}
      <footer className={"mb-3"}>
        <div className={"container d-flex justify-content-between"}>
          <a href={"https://www.codeforpdx.org/"}>Code For PDX</a>
          <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/isolation.html">
            CDC guidelines on isolation
          </a>
          <a href="https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/quarantine.html">
            CDC guidelines on quarantine
          </a>
        </div>
      </footer>
    </>
  );
}
