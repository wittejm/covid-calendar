import React from "react";
import GridView from "./GridView";
import Household from "./Household";
import { PersonData, CovidEvent } from "./types";

interface Props {}

interface State {
  members: PersonData[];
}

export default class App extends React.Component<Props, State> {
  state: State = {
    members: [
      {
        name: `Person 1`,
        covidEvents: []
      }
    ]
  };

  handleNewPerson = () => {
    let updatedmembers: PersonData[] = JSON.parse(
      JSON.stringify(this.state.members)
    );
    updatedmembers.push({
      name: `Person ${this.state.members.length + 1}`,
      covidEvents: []
    });
    this.setState({
      members: updatedmembers
    });
  };

  handleNewEvent = () => {};

  handleRemovePerson = (index: number) => {
    let updatedmembers: PersonData[] = JSON.parse(
      JSON.stringify(this.state.members)
    );
    updatedmembers.splice(index, 1);
    this.setState({
      members: updatedmembers
    });
  };

  render() {
    return (
      <main className="f7 f5-l">
        <h1>Covid Quarantine Qualculator</h1>
        <div className="flex-l">
          <div className="w-30-l bw1 bg-light-gray pt5 pb5 pb7-l ph4 pr5-l">
            <div className="center mr0-l ml-auto-l">
              <Household
                members={this.state.members}
                handleNewPerson={this.handleNewPerson}
                handleRemovePerson={this.handleRemovePerson}
                handleNewEvent={this.handleNewEvent}
              />
            </div>
          </div>
          <div className="w-70-l pt2 pt5-l pb2 ph2 ph6-l">
            <GridView />
          </div>
        </div>
      </main>
      // Persons on the left
      // Calendar on the right.
    );
  }
}
