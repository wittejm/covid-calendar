import React from "react";
import GridView from "./GridView";
import Definitions from "./Definitions";
import Footer from "./Footer";
import Instructions from "./Instructions";
import { InHouseExposure, PersonData } from "./types";
import { State } from "@hookstate/core/dist";
import { Link } from "react-router-dom";
import { t, jt} from "ttag";

interface Props {
  language: string;
  setLanguage: Function;
}

export default function Home(props: Props) {
  function renderTitle() {
    return (
      <>
        <h1 className="page-header mb-4">
          {" "}
          {t`This calculator determines whether you’ll quarantine or isolate, and for how long. `}
        </h1>
        <p className="f4"> {t`Answer a few simple questions and we will match your situation to the best advice according to CDC guidelines.`} </p>
        <div style={{ alignItems: "left", position: "relative", paddingBottom: "120px" }}>
          <Link className="get-started-link"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px 40px",
              position: "absolute",
              borderRadius: "40px",
              width: "225px",
              height: "58px",
              top: "20px",
              fontFamily: "Arial",
              fontStyle: "normal",
              fontWeight: "bold",
              fontSize: "18px",
              lineHeight: "160%",
              textAlign: "left",
              letterSpacing: "0.02em",
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
          >
            <Link to="/" className="d-flex align-items-center home-link">{t`COVID CALCULATOR`}</Link>
            <button className="language-button" onClick={()=> props.setLanguage(props.language==="en" ? "es" : "en")}>
              <div>{(props.language==="en" ? "ESPAÑOL" : "ENGLISH")}</div>
            </button>
          </div>
        </div>
      </header>
      <main className={"main  off-black"} role={"main"} style={{ paddingBottom: "250px"}}>
        <section className={"jumbotron"} style={{ background: "#FFFFFF" }}>
          <div className="container">{renderTitle()}</div>
        </section>
        <section className={"jumbotron"} >
            <div className="container">
              <hr/>
              <Definitions/>
            </div>
        </section>
        <section className={"jumbotron"} style={{ background: "#FFFFFF" }}>
          <div className="container">
            <Instructions/>
          </div>
          <div style={{ width: "auto", alignItems:"center", justifyContent: "center", position: "relative", paddingBottom: "120px", paddingLeft:"calc(50% - 350px)"}}>
          <Link className="get-started-link"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "18px 40px",
              position: "absolute",
              borderRadius: "40px",
              width: "100%",
              maxWidth: "700px",
              height: "80",
              top: "20px",
              fontFamily: "Arial",
              fontStyle: "normal",
              fontWeight: "bold",
              fontSize: "18px",
              lineHeight: "160%",
              textAlign: "center",
              letterSpacing: "0.02em",
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
        </section>

      </main>
      <Footer/>
    </div>
  );
}
