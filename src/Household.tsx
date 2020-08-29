import React from 'react'
import {PersonData, CovidEvent, AllEvents} from './types'

interface Props {
  members: PersonData[];
  handleNewEvent: Function;
  handleNewPerson: Function;
  handleRemovePerson: Function;
}

export default class Household extends React.Component<Props> {
  render() {
    return (
      <div className="">
        <div className="f3">Household</div>
        <div className="pa2">
          {this.props.members.map((person: PersonData, i) => {
            return (
                <div className="f4">
                {person.name}

                {this.props.members.length >1 &&
                    <button onClick={()=>{this.props.handleRemovePerson()}}>
                    <span className="visually-hidden">Remove Person</span>
                    <i aria-hidden="true" className="pl2 fas fa-times-circle gray"></i>
                    </button>
                }

                <div className="pl3">
                {AllEvents.map((event: CovidEvent, i) => {
                  return (
                      <div className="f5">
                        <button>
                        {"+ " + event.name}
                        </button>
                        </div>
                      )})}

                </div>
                </div>
              )
        }
          )}
      <button className="pa2 f5 fw6" onClick={()=>{this.props.handleNewPerson()}}>
        Add Person
        </button>
      </div>
      </div>
    )
  }
}