import { CalculationResult, CovidEventName, PersonData } from "./types";
import * as _ from "lodash";
import moment, { Moment } from "moment";

export function computeHouseHoldQuarantinePeriod(
  household: PersonData[]
): CalculationResult[] {
  return household.map((person: PersonData, i: number) => {
    const isolationPeriod = computeIsolationPeriod(person);
    if (isolationPeriod) {
      return { person: person, date: isolationPeriod };
    } else {
      // TODO:
      return { person: person, date: moment() };
    }
  });
}

export function computeIsolationPeriod(person: PersonData): Moment | undefined {
  const illnessOnset = _.chain(person.covidEvents)
    .filter(event => {
      return (
        event.name === CovidEventName.SymptomsStart ||
        event.name === CovidEventName.PositiveTest
      );
    })
    .map("date")
    .thru(dates => (_.isEmpty(dates) ? undefined : moment.min(dates)))
    .value();
  const tenDaysAfterOnset = illnessOnset?.add(10, "days");
  const symptomsEnd = _.chain(person.covidEvents)
    .filter(event => {
      return event.name === CovidEventName.SymptomsEnd;
    })
    .map("date")
    .first()
    .value();
  const dayAfterSymptomsEnd = symptomsEnd?.add(1, "days");
  return _.chain([tenDaysAfterOnset, dayAfterSymptomsEnd])
    .compact()
    .thru(dates => (_.isEmpty(dates) ? undefined : moment.max(dates)))
    .value();
}
