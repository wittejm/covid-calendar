import { CalculationResult, CovidEventName, PersonData } from "./types";
import * as _ from "lodash";
import { addDays, max, min, isValid } from "date-fns";

export function computeHouseHoldQuarantinePeriod(
  household: PersonData[]
): CalculationResult[] {
  return household.map((person: PersonData, i: number) => {
    const isolationPeriod = computeIsolationPeriod(person);
    if (isValid(isolationPeriod)) {
      return { person: person, date: isolationPeriod };
    } else {
      // TODO:
      return { person: person, date: new Date() };
    }
  });
}

export function computeIsolationPeriod(person: PersonData): Date {
  const illnessOnset = _.chain(person.covidEvents)
    .filter(event => {
      return (
        event.name === CovidEventName.SymptomsStart ||
        event.name === CovidEventName.PositiveTest
      );
    })
    .map("date")
    .thru(dates => min(dates))
    .value();
  const tenDaysAfterOnset = illnessOnset && addDays(illnessOnset, 10);
  const symptomsEnd = _.chain(person.covidEvents)
    .filter(event => {
      return event.name === CovidEventName.SymptomsEnd;
    })
    .map("date")
    .first()
    .value();
  const dayAfterSymptomsEnd = symptomsEnd && addDays(symptomsEnd, 1);
  return _.chain([tenDaysAfterOnset, dayAfterSymptomsEnd])
    .compact()
    .thru(dates => max(dates))
    .value();
}
