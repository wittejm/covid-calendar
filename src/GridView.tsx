import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

export default class GridView extends React.Component {
  render() {
    return (
      <div className="">
          <FullCalendar
            plugins={[ dayGridPlugin ]}
            initialView="dayGridMonth"
          />
      </div>
    )
  }
}