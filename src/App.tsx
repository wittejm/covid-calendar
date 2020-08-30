import React from "react";
import GridView from "./GridView";
import Household from "./Household";
import { PersonData, CovidEvent, CovidEventName } from "./types";
import moment, { Moment } from "moment";

interface Props {}

interface State {
  members: PersonData[];
  editing: boolean;
}

export default class App extends React.Component<Props, State> {
  state: State = {
    members: [
      {
        name: `Alice`,
        covidEvents: [
          {
            name: CovidEventName.LastCloseContact,
            date: moment("8-25-2020", "MM-DD-YYYY")
          }
          /*
            {
                name: CovidEventName.SymptomsStart,
                date: moment("8-28-2020","MM-DD-YYYY")
            },
            {
                name: CovidEventName.PositiveTest,
                date: moment("8-29-2020","MM-DD-YYYY")
            }
            */
        ],
        isNewPerson: false,
        editing: false
      },
      {
        name: `Bob`,
        covidEvents: [
          {
            name: CovidEventName.LastCloseContact,
            date: moment("8-28-2020", "MM-DD-YYYY")
          }
        ],
        isNewPerson: false,
        editing: false
      }
    ],
    editing: false
  };

  handleAddNewPerson = () => {
    let updatedMembers: PersonData[] = JSON.parse(
      JSON.stringify(this.state.members)
    );
    updatedMembers.push({
      name: `Person ${this.state.members.length + 1}`,
      covidEvents: [],
      isNewPerson: true,
      editing: true
    });
    this.setState({
      members: updatedMembers,
      editing: true
    });
  };

  handlePersonChanges = (updatedPersonData: PersonData, index: number) => {
    let updatedMembers: PersonData[] = JSON.parse(
      JSON.stringify(this.state.members)
    );
    updatedMembers[index] = updatedPersonData;
    this.setState({
      members: updatedMembers
    });
  };

  handleRemovePerson = (index: number) => {
    let updatedMembers: PersonData[] = JSON.parse(
      JSON.stringify(this.state.members)
    );
    updatedMembers.splice(index, 1);
    this.setState({
      members: updatedMembers
    });
  };

  render() {
    return (
      <main className="f7 f5-l">
        <h1>Covid Quarantine Qualculator</h1>
        <div className="flex-l">
          <div className="w-70-l bw1 bg-light-gray pt5 pb5 pb7-l ph4 pr5-l">
            <div className="center mr0-l ml-auto-l">
              <Household
                members={this.state.members}
                handleAddNewPerson={this.handleAddNewPerson}
                handlePersonChanges={this.handlePersonChanges}
                handleRemovePerson={this.handleRemovePerson}
                editing={this.state.editing}
              />
            </div>
          </div>
          <div className="w-30-l pt2 pt5-l pb2 ph2 pr4-l">
            <GridView members={this.state.members} />
          </div>
        </div>
      </main>
      // Persons on the left
      // Calendar on the right.
    );
  }
}
