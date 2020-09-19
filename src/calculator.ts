import {
  Guidance,
  CovidEventName,
  InHouseExposure,
  PersonData,
  Exposure
} from "./types";
import { addDays, parse } from "date-fns";
import {
  flow,
  compact,
  map,
  thru,
  partition,
  filter,
  max,
  maxBy,
  min,
  minBy
} from "lodash/fp";

export function computeHouseHoldQuarantinePeriod(
  household: PersonData[],
  inHouseExposures: InHouseExposure[]
): Guidance[] {
  const [infectedGuidances, quarantinedGuidances] = flow(
    map((person: PersonData) => {
      const isolationPeriod = computeIsolationPeriod(person);
      if (isolationPeriod) {
        const [startDate, endDate] = isolationPeriod;
        return {
          person: person,
          infected: true,
          startDate: startDate,
          endDate: endDate
        };
      } else {
        return {
          person: person,
          infected: false
        };
      }
    }),
    partition(c => c.infected)
  )(household);
  const updatedQuarantinedGuidance: Guidance[] = quarantinedGuidances.map(
    guidance =>
      computeQuarantineGuidance(guidance, inHouseExposures, infectedGuidances)
  );
  return [...infectedGuidances, ...updatedQuarantinedGuidance];
}

export function computeIsolationPeriod(person: PersonData): Date[] | undefined {
  const covidPositiveEvents = [
    person.covidEvents[CovidEventName.SymptomsStart],
    person.covidEvents[CovidEventName.PositiveTest]
  ];
  const illnessOnset = flow(
    compact,
    map((date: string) => parse(date, "M/dd/yyyy", new Date())),
    thru((dates: Date[]) => min(dates))
  )(covidPositiveEvents);
  if (illnessOnset) {
    const tenDaysAfterOnset = addDays(illnessOnset, 10);
    const symptomsEnd = person.noSymptomsFor24Hours ? undefined : new Date(); // TODO: Rethink
    const isolationEndDate = flow(
      compact,
      thru((dates: Date[]) => max(dates))
    )([tenDaysAfterOnset, symptomsEnd]);
    return [illnessOnset, isolationEndDate];
  }
}

function computeQuarantineGuidance(
  guidance: Guidance,
  inHouseExposures: InHouseExposure[],
  infectedGuidances: Guidance[]
) {
  const person = guidance.person;
  const relevantInHouseExposures = filter(
    (event: InHouseExposure) =>
      event.quarantinedPerson === person.id && event.exposed
  )(inHouseExposures);
  const normalize = map((event: InHouseExposure) => {
    const infectedGuidance = infectedGuidances.find(
      guidance => guidance.person.id === event.contagiousPerson
    ) as Guidance;
    if (event.ongoing) {
      return {
        startDate: infectedGuidance.startDate as Date,
        endDate: infectedGuidance.endDate as Date,
        infectionSource: infectedGuidance.person
      };
    } else {
      return {
        startDate: infectedGuidance.startDate as Date,
        endDate: parse(event.date, "M/dd/yyyy", new Date()),
        infectionSource: infectedGuidance.person
      };
    }
  });
  const normalizedInHouseExposures = compact(
    normalize(relevantInHouseExposures)
  );
  const exposures = addOutsideExposures(person, normalizedInHouseExposures);
  const earliestExposure = minBy(exposure => exposure.startDate, exposures);
  const latestExposure = maxBy(exposure => exposure.endDate, exposures);
  let startDate = earliestExposure?.startDate;
  let endDate = undefined;
  if (latestExposure) {
    endDate = addDays(latestExposure.endDate, 14);
  }
  const peopleWithOngoingExposureWithSymptoms = flow(
    map((event: InHouseExposure) => {
      if (event.ongoing) {
        const personWithOngoingExposure = infectedGuidances.find(
          guidance => guidance.person.id === event.contagiousPerson
        )?.person;
        if (!personWithOngoingExposure?.noSymptomsFor24Hours) {
          return personWithOngoingExposure?.name;
        }
      }
    }),
    compact
  )(relevantInHouseExposures);
  return {
    person: person,
    infected: false,
    startDate: startDate,
    endDate: endDate,
    infectionSource: latestExposure && latestExposure.infectionSource,
    peopleWithOngoingExposureWithSymptoms: peopleWithOngoingExposureWithSymptoms
  };
}

function addOutsideExposures(person: PersonData, exposures: Exposure[]) {
  const outHouseExposureDateString =
    person.covidEvents[CovidEventName.LastCloseContact];
  if (outHouseExposureDateString) {
    const outHouseExposureDate = parse(
      outHouseExposureDateString,
      "M/dd/yyyy",
      new Date()
    );
    const outHouseExposure = {
      startDate: outHouseExposureDate,
      endDate: outHouseExposureDate,
      infectionSource: undefined
    };
    exposures = [...exposures, outHouseExposure];
  }
  return exposures;
}
