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
  const illnessOnset = person.covidEvents.SymptomsStart && person.covidEvents.SymptomsStart;
  const tenDaysAfterOnset = illnessOnset && addDays(illnessOnset, 10);
  const symptomsEnd = person.covidEvents.SymptomsEnd && person.covidEvents.SymptomsEnd;
  const dayAfterSymptomsEnd = symptomsEnd && addDays(symptomsEnd, 1);
  return _.chain([tenDaysAfterOnset, dayAfterSymptomsEnd])
    .compact()
    .thru(dates => max(dates))
    .value();
}
