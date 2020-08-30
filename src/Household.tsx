import React from "react";
import { PersonData, CovidEventName, CovidEvent } from "./types";
import Person from "./Person";

interface Props {
  members: PersonData[];
  handleAddNewPerson: Function;
  handlePersonChanges: Function;
  handleRemovePerson: Function;
  editing: boolean;
}
interface State {
  editing: boolean;
}

export default class Household extends React.Component<Props, State> {
  state = {
    editing: this.props.editing
  };

  render() {
    return (
      <div className="">
        <div className="f3">Household</div>
        <div className="pa2">
          {this.props.members.map((personData: PersonData, i) => {
            return (
              <Person
                personIndex={i}
                personData={personData}
                submitPersonData={(
                  updatedPersonData: PersonData,
                  index: number
                ) => {
                  this.setState({ editing: false });
                  this.props.handlePersonChanges(updatedPersonData, index);
                }}
                handleRemovePerson={() => {
                  this.props.handleRemovePerson(i);
                  this.setState({ editing: false });
                }}
                handleBeginEdit={() => {
                  this.setState({ editing: true });
                }}
                handleCancelEdit={() => {
                  if (personData.isNewPerson) {
                    this.props.handleRemovePerson(i);
                  }
                  this.setState({ editing: false });
                }}
                editingHousehold={this.state.editing}
              />
            );
          })}
          {!this.state.editing && (
            <button
              className="pa2 f5 fw6"
              onClick={() => {
                this.props.handleAddNewPerson();
                this.setState({ editing: true });
              }}
            >
              Add Person
            </button>
          )}
        </div>
      </div>
    );
  }
}
