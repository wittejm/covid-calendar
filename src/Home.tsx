import React from "react";
import GridView from "./GridView";
import Definitions from "./Definitions";
import Footer from "./Footer";
import { InHouseExposure, PersonData } from "./types";
import { State } from "@hookstate/core/dist";
import { Link } from "react-router-dom";
import { t, jt } from "ttag";

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
            fontSize: "2.1rem",
            fontStyle: "normal",
            textAlign: "center",
            color: "#1F252F"

          }}
        >
          {" "}
          {t`This calculator determines whether you’ll quarantine or isolate, and for how long. `}
        </h1>
        <p className="f3"> {t`Answer a few simple questions and we will match your situation to the best advice according to CDC guidelines.`}

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
            {t`Get Started`}
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
            <div className="d-flex align-items-center">{t`COVID CALCULATOR`}</div>
            <div>{t`ESPAÑOL`}</div>
          </div>
        </div>
      </header>
      <main className={"main  off-black"} role={"main"} style={{ paddingBottom: "250px"}}>
        <section className={"jumbotron"} style={{ background: "#FFFFFF" }}>
          <div className="container">{renderTitle()}</div>
        </section>
        <Definitions/>
      </main>
      <Footer/>
    </div>
  );
}
