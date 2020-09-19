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
  min
} from "lodash/fp";

export function computeHouseHoldQuarantinePeriod(
  household: PersonData[],
  inHouseExposures: InHouseExposure[]
): Guidance[] {
  const [infectedGuidance, quarantinedGuidance] = flow(
    map((person: PersonData) => {
      const isolationEndDate = computeIsolationPeriod(person);
      if (isolationEndDate) {
        return {
          person: person,
          infected: true,
          endDate: isolationEndDate
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
  const updatedQuarantinedGuidance: Guidance[] = quarantinedGuidance.map(
    guidance =>
      computeQuarantineGuidance(guidance, inHouseExposures, infectedGuidance)
  );
  return [...infectedGuidance, ...updatedQuarantinedGuidance];
}

export function computeIsolationPeriod(person: PersonData): Date | undefined {
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
    return isolationEndDate;
  }
}

function computeQuarantineGuidance(
  guidance: Guidance,
  inHouseExposures: InHouseExposure[],
  infectedGuidance: Guidance[]
) {
  const person = guidance.person;
  const relevantInHouseExposures = filter(
    (event: InHouseExposure) =>
      event.quarantinedPerson === person.id && event.exposed
  )(inHouseExposures);
  const normalize = map((event: InHouseExposure) => {
    const infected = infectedGuidance.find(
      calculation => calculation.person.id === event.contagiousPerson
    ) as Guidance;
    if (event.ongoing) {
      return {
        date: infected.endDate as Date,
        infectionSource: infected.person
      };
    } else {
      return {
        date: parse(event.date, "M/dd/yyyy", new Date()),
        infectionSource: infected.person
      };
    }
  });
  const normalizedInHouseExposures = compact(
    normalize(relevantInHouseExposures)
  );
  const exposures = addOutsideExposures(person, normalizedInHouseExposures);
  const latestExposure = maxBy(exposure => exposure.date, exposures);
  let endDate = undefined;
  if (latestExposure) {
    endDate = addDays(latestExposure.date, 14);
  }
  const peopleWithOngoingExposureWithSymptoms = flow(
    map((event: InHouseExposure) => {
      if (event.ongoing) {
        const personWithOngoingExposure = infectedGuidance.find(
          calculation => calculation.person.id === event.contagiousPerson
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
      date: outHouseExposureDate,
      infectionSource: undefined
    };
    exposures = [...exposures, outHouseExposure];
  }
  return exposures;
}
