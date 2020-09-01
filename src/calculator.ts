import { CalculationResult, PersonData } from "./types";
import * as _ from "lodash";
import { addDays, max, min, isValid } from "date-fns";

export function computeHouseHoldQuarantinePeriod(
  household: PersonData[]
): CalculationResult[] {
  const [infected, quarantined] = _.chain(household)
    .map((person: PersonData) => {
      const [illnessOnset, isolationEndDate] = computeIsolationPeriod(person);
      if (isValid(isolationEndDate)) {
        return {
          person: person,
          startDate: illnessOnset,
          endDate: isolationEndDate,
          infected: true
        };
      } else {
        return {
          person: person,
          startDate: new Date(),
          endDate: new Date(),
          infected: false
        };
      }
    })
    .partition("infected")
    .value();
  const quarantinedCalculations: CalculationResult[] = _.map(
    quarantined,
    calculation => {
      const person = calculation.person;
      const exposureEvents = _.pick(
        person.covidEvents.InHouseExposure,
        _.map(infected, infectedCalculation => infectedCalculation.person.name)
      );
      const moreExposureEvents = _.map(infected, infectedCalculation => {
        const infectedPerson = infectedCalculation.person;
        const exposureDate =
          infectedPerson.covidEvents.InHouseExposure?.[person.name];
        if (exposureDate) {
          return { [infectedPerson.name]: exposureDate };
        } else {
          return { [infectedPerson.name]: infectedCalculation.endDate };
        }
      });
      const mergedExposureEvents = _.assign(
        {},
        ...moreExposureEvents,
        exposureEvents
      );
      const exposureDates = _.values(mergedExposureEvents);
      const latestStatedExposureDate = person.covidEvents.LastCloseContact;
      const earliestExposureDate = latestStatedExposureDate
        ? min([...exposureDates, latestStatedExposureDate])
        : min(exposureDates);
      const latestExposureDate = latestStatedExposureDate
        ? max([...exposureDates, latestStatedExposureDate])
        : max(exposureDates);
      const fourteenDaysFromLastExposure = addDays(latestExposureDate, 14);
      return {
        person: person,
        startDate: earliestExposureDate,
        endDate: fourteenDaysFromLastExposure,
        infected: false
      };
    }
  );
  return [...infected, ...quarantinedCalculations];
}

export function computeIsolationPeriod(person: PersonData): [Date, Date] {
  const illnessOnset = _.chain([
    person.covidEvents.SymptomsStart,
    person.covidEvents.PositiveTest
  ])
    .compact()
    .thru(dates => min(dates))
    .value();
  const tenDaysAfterOnset = illnessOnset && addDays(illnessOnset, 10);
  const symptomsEnd = person.covidEvents.SymptomsEnd;
  const dayAfterSymptomsEnd = symptomsEnd && addDays(symptomsEnd, 1);
  const isolationEndDate = _.chain([tenDaysAfterOnset, dayAfterSymptomsEnd])
    .compact()
    .thru(dates => max(dates))
    .value();
  return [illnessOnset, isolationEndDate];
}
