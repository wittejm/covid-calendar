import {
  CalculationResult,
  CovidEventName,
  InHouseExposureEvent,
  PersonData,
  today
} from "./types";
import { addDays, max, min, isValid, parse } from "date-fns";
import { flow, compact, map, thru, partition, filter } from "lodash/fp";

export function computeHouseHoldQuarantinePeriod(
  household: PersonData[],
  inHouseExposureEvents: InHouseExposureEvent[]
): CalculationResult[] {
  const [infected, quarantined] = flow(
    map((person: PersonData) => {
      const isolationEndDate = computeIsolationPeriod(person);
      if (isValid(isolationEndDate)) {
        return {
          person: person,
          endDate: isolationEndDate,
          infected: true
        };
      } else {
        return {
          person: person,
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
      const latestExposureDate = max(
        compact([
          ...lastExposureDate(relevantInHouseExposureEvents),
          outHouseExposureDate
        ])
      );
      const peopleWithOngoingExposureWithSymptoms = flow(
        map((event: InHouseExposureEvent) => {
          if (event.ongoing) {
            const personWithOngoingExposure = infected.find(
              calculation => calculation.person.id === event.contagiousPerson
            )?.person;
            if (!personWithOngoingExposure?.noSymptomsFor24Hours) {
              return personWithOngoingExposure?.name;
            }
          }
        }),
        compact
      )(relevantInHouseExposureEvents);
      const fourteenDaysFromLastExposure = addDays(latestExposureDate, 14);
      return {
        person: person,
        endDate: fourteenDaysFromLastExposure,
        peopleWithOngoingExposureWithSymptoms: peopleWithOngoingExposureWithSymptoms,
        infected: false

      };
    }
  );
  const stillInfected = filter((result: CalculationResult)=>result.endDate >= today)(infected);
  const stillQuarantined = filter((result: CalculationResult)=>result.endDate >= today)(quarantinedCalculations);
  return [...stillInfected, ...stillQuarantined];
}

export function computeIsolationPeriod(person: PersonData): Date {
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
  const symptomsEnd = person.noSymptomsFor24Hours ? undefined : new Date(); // TODO: Rethink
  const isolationEndDate = flow(
    compact,
    thru((dates: Date[]) => max(dates))
  )([tenDaysAfterOnset, symptomsEnd]);
  return isolationEndDate;
}
