import React from "react";
import { PersonData, CovidEvent, CovidEventName } from "./types";
import moment, { Moment } from "moment";

interface Props {
  personIndex: number;
  personData: PersonData;
  submitPersonData: Function;
  handleCancelEdit: Function;
  handleBeginEdit: Function;
  handleRemovePerson: Function;
  editingHousehold: boolean;
}

interface State {
  name: string;
  lastCloseContactDate: string;
  positiveTestDate: string;
  firstSymptomsDate: string;
  symptomsResolved: string;
  exposuresInHousehold: any;
  editing: boolean;
}

export default class Person extends React.Component<Props, State> {
  state = {
    name: this.props.personData.name,
    lastCloseContactDate: "",
    positiveTestDate: "",
    firstSymptomsDate: "",
    symptomsResolved: "",
    exposuresInHousehold: null,
    editing: this.props.personData.editing
  };

  handleChange = (e: React.BaseSyntheticEvent) => {
    this.setState<any>({
      [e.target.name]: e.target.value
    });
  };
  handleSubmitClick = () => {
    let covidEvents: CovidEvent[] = [];
    if (this.state.lastCloseContactDate) {
      covidEvents.push({
        name: CovidEventName.LastCloseContact,
        date: moment(this.state.lastCloseContactDate, "MM-DD-YYYY")
      });
    }
    if (this.state.positiveTestDate) {
      covidEvents.push({
        name: CovidEventName.PositiveTest,
        date: moment(this.state.positiveTestDate, "MM-DD-YYYY")
      });
    }
    if (this.state.firstSymptomsDate) {
      covidEvents.push({
        name: CovidEventName.SymptomsStart,
        date: moment(this.state.firstSymptomsDate, "MM-DD-YYYY")
      });
    }
    const personData = {
      name: this.state.name,
      covidEvents: covidEvents,
      isNewPerson: false,
      editing: false
    };
    this.props.submitPersonData(personData, this.props.personIndex);
    this.setState({ editing: false });
  };

  render() {
    return (
      <div className="f4 ba bw1 pa2">
        {this.props.personData.name}{" "}
        {!this.props.editingHousehold && (
          <button
            onClick={() => {
              this.props.handleBeginEdit();
              this.setState({ editing: true });
            }}
          >
            <span className="visually-hidden">Edit Person</span>
            <span aria-hidden="true" className="pl2 f5 fas fa-pen"></span>
          </button>
        )}
        {this.state.editing ? (
          <div className="pa3">
            <button
              onClick={() => {
                this.props.handleCancelEdit();
                this.setState({ editing: false });
              }}
            >
              <span className="visually-hidden">Cancel</span>
              {this.props.personData.isNewPerson ? "Cancel Add" : "Cancel Edit"}
              <i
                aria-hidden="true"
                className="pl2 fas fa-times-circle gray"
              ></i>
            </button>
            {!this.props.personData.isNewPerson && (
              <button
                onClick={() => {
                  this.props.handleRemovePerson();
                }}
              >
                <span className="visually-hidden">Remove Person</span>
                Remove Person
                <i
                  aria-hidden="true"
                  className="pl2 fas fa-times-circle gray"
                ></i>
              </button>
            )}
            <div>
              Name:
              <input
                value={this.state.name}
                name="name"
                id={`${this.props.personIndex}-${this.state.name}`}
                type="text"
                onChange={this.handleChange}
              />
            </div>

            <div>
              When is the last date you have been exposed to someone covid
              positive outside the household?
              <input
                value={this.state.lastCloseContactDate}
                name="lastCloseContactDate"
                id={`${this.props.personIndex}-${this.state.lastCloseContactDate}`}
                type="text"
                /*
                Accessibility Stuff TODO.
                required={this.props.required}
                aria-invalid={this.state.hasInput}
                aria-describedby={
                  this.props.required && this.state.hasInput
                    ? this.props.errorMessage
                    : undefined
                }
                */
                onChange={this.handleChange}
              />
            </div>
            <div>
              If you have received a positive test result, what date did you
              take the test?
              <input
                value={this.state.positiveTestDate}
                name="positiveTestDate"
                id={`${this.props.personIndex}-${this.state.positiveTestDate}`}
                type="text"
                onChange={this.handleChange}
              />
            </div>
            <div>
              If you are or were showing symptoms, when did your symptoms begin?
              <input
                value={this.state.firstSymptomsDate}
                name="firstSymptomsDate"
                id={`${this.props.personIndex}-${this.state.firstSymptomsDate}`}
                type="text"
                onChange={this.handleChange}
              />
            </div>
            <button
              className="fw5 pa2 bg-green white bg-animate hover-bg-light-green"
              onClick={this.handleSubmitClick}
            >
              Submit Person Information
            </button>
          </div>
        ) : (
          <div className="pl3">
            {console.log(this.props.personData.covidEvents)}
            {this.props.personData.covidEvents.map((event: CovidEvent, i) => {
              return (
                <div className="f5">
                  {event.name} {": "} {moment(event.date).format("MM/DD/YYYY")}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
