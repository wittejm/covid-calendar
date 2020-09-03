import { CalculationResult, InHouseExposureEvent, PersonData } from "./types";
import * as _ from "lodash";
import { addDays, max, min, isValid, parse } from "date-fns";

export function computeHouseHoldQuarantinePeriod(
  household: PersonData[],
  inHouseExposureEvents: InHouseExposureEvent[]
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
      const exposureEvents = inHouseExposureEvents.filter(
        event => event.quarantinedPerson === person && event.exposed
      );
      const exposureDates = exposureEvents.map(event => {
        if (event.ongoing) {
          return (
            infected.find(
              calculation => calculation.person === event.contagiousPerson
            )?.endDate || new Date()
          );
        } else {
          return parse(event.date, "M/dd/yyyy", new Date());
        }
      });
      const latestStatedExposureDate = person.covidEvents.LastCloseContact
        ? parse(person.covidEvents.LastCloseContact, "M/dd/yyyy", new Date())
        : undefined;
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
    .map(date => parse(date, "M/dd/yyyy", new Date()))
    .thru(dates => min(dates))
    .value();
  const tenDaysAfterOnset = illnessOnset && addDays(illnessOnset, 10);
  const symptomsEnd = person.covidEvents.SymptomsEnd
    ? parse(person.covidEvents.SymptomsEnd, "M/dd/yyyy", new Date())
    : undefined;
  const dayAfterSymptomsEnd = symptomsEnd && addDays(symptomsEnd, 1);
  const isolationEndDate = _.chain([tenDaysAfterOnset, dayAfterSymptomsEnd])
    .compact()
    .thru(dates => max(dates))
    .value();
  return [illnessOnset, isolationEndDate];
}
