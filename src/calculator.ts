import {
  CalculationResult,
  CovidEventName,
  InHouseExposureEvent,
  PersonData
} from "./types";
import { addDays, max, min, isValid, parse } from "date-fns";
import { flow, compact, map, thru, partition, filter } from "lodash/fp";

export function computeHouseHoldQuarantinePeriod(
  household: PersonData[],
  inHouseExposureEvents: InHouseExposureEvent[]
): CalculationResult[] {
  const [infected, quarantined] = flow(
    map((person: PersonData) => {
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
    }),
    partition(c => c.infected)
  )(household);
  const quarantinedCalculations: CalculationResult[] = quarantined.map(
    calculation => {
      const person = calculation.person;
      const relevantInHouseExposureEvents = filter(
        (event: InHouseExposureEvent) =>
          event.quarantinedPerson === person.id && event.exposed
      )(inHouseExposureEvents);
      const firstExposureDate = map((event: InHouseExposureEvent) => {
        return infected.find(
          calculation => calculation.person.id === event.contagiousPerson
        )?.startDate;
      });
      const lastExposureDate = map((event: InHouseExposureEvent) => {
        if (event.ongoing) {
          return infected.find(
            calculation => calculation.person.id === event.contagiousPerson
          )?.endDate;
        } else {
          return parse(event.date, "M/dd/yyyy", new Date());
        }
      });
      const outHouseExposureDateString =
        person.covidEvents[CovidEventName.LastCloseContact];
      const outHouseExposureDate = outHouseExposureDateString
        ? parse(outHouseExposureDateString, "M/dd/yyyy", new Date())
        : undefined;
      const earliestExposureDate = min(
        compact([
          ...firstExposureDate(relevantInHouseExposureEvents),
          outHouseExposureDate
        ])
      );
      const latestExposureDate = max(
        compact([
          ...lastExposureDate(relevantInHouseExposureEvents),
          outHouseExposureDate
        ])
      );
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
  const covidPositiveEvents = [
    person.covidEvents[CovidEventName.SymptomsStart],
    person.covidEvents[CovidEventName.PositiveTest]
  ];
  const illnessOnset = flow(
    compact,
    map((date: string) => parse(date, "M/dd/yyyy", new Date())),
    thru((dates: Date[]) => min(dates))
  )(covidPositiveEvents);
  const tenDaysAfterOnset = illnessOnset && addDays(illnessOnset, 10);
  const symptomsEnd = person.covidEvents[CovidEventName.SymptomsEnd]
    ? parse(
        person.covidEvents[CovidEventName.SymptomsEnd],
        "M/dd/yyyy",
        new Date()
      )
    : undefined;
  const dayAfterSymptomsEnd = symptomsEnd && addDays(symptomsEnd, 1);
  const isolationEndDate = flow(
    compact,
    thru((dates: Date[]) => max(dates))
  )([tenDaysAfterOnset, dayAfterSymptomsEnd]);
  return [illnessOnset, isolationEndDate];
}
