import {
  computeHouseHoldQuarantinePeriod,
  computeIsolationPeriod
} from "./calculator";
import { CovidEventName, PersonData } from "./types";
import { isValid, parseISO } from "date-fns";

const empty: PersonData = {
  id: 0,
  name: "Empty",
  covidEvents: {
    [CovidEventName.LastCloseContact]: "",
    [CovidEventName.SymptomsStart]: "",
    [CovidEventName.PositiveTest]: ""
  },
  noSymptomsFor24Hours: true,
  isNewPerson: false,
  editing: false
};

const personWithPositiveSymptoms: PersonData = {
  id: 1,
  name: "Person with positive symptoms",
  covidEvents: {
    [CovidEventName.SymptomsStart]: "01/01/2020",
    [CovidEventName.LastCloseContact]: "",
    [CovidEventName.PositiveTest]: ""
  },
  noSymptomsFor24Hours: true,
  isNewPerson: false,
  editing: false
};

const personWithPositiveTest: PersonData = {
  id: 2,
  name: "Person with positive test",
  covidEvents: {
    [CovidEventName.PositiveTest]: "01/01/2020",
    [CovidEventName.LastCloseContact]: "",
    [CovidEventName.SymptomsStart]: ""
  },
  noSymptomsFor24Hours: true,
  isNewPerson: false,
  editing: false
};

const personWithPositiveSymptomsAndTest: PersonData = {
  id: 3,
  name: "Person with positive symptoms and test",
  covidEvents: {
    [CovidEventName.PositiveTest]: "01/01/2020",
    [CovidEventName.SymptomsStart]: "01/05/2020",
    [CovidEventName.LastCloseContact]: ""
  },
  noSymptomsFor24Hours: true,
  isNewPerson: false,
  editing: false
};

const personWithOngoingSymptoms: PersonData = {
  id: 4,
  name: "Person with ongoing symptoms",
  covidEvents: {
    [CovidEventName.PositiveTest]: "01/01/2020",
    [CovidEventName.SymptomsStart]: "01/05/2020",
    [CovidEventName.LastCloseContact]: ""
  },
  noSymptomsFor24Hours: false,
  isNewPerson: false,
  editing: false
};

const personWithOutsideExposure: PersonData = {
  id: 5,
  name: "Person with outside exposure",
  covidEvents: {
    [CovidEventName.PositiveTest]: "",
    [CovidEventName.SymptomsStart]: "",
    [CovidEventName.LastCloseContact]: "01/01/2020"
  },
  noSymptomsFor24Hours: true,
  isNewPerson: false,
  editing: false
};

test("Empty", () => {
  const [, endDate] = computeIsolationPeriod(empty);
  expect(isValid(endDate)).toBe(false);
});

test("Person with positive symptoms isolates for 10 days", () => {
  const [startDate, endDate] = computeIsolationPeriod(
    personWithPositiveSymptoms
  );
  expect(startDate).toStrictEqual(parseISO("2020-01-01"));
  expect(endDate).toStrictEqual(parseISO("2020-01-11"));
});

test("Person with positive test isolates for 10 days", () => {
  const [startDate, endDate] = computeIsolationPeriod(personWithPositiveTest);
  expect(startDate).toStrictEqual(parseISO("2020-01-01"));
  expect(endDate).toStrictEqual(parseISO("2020-01-11"));
});

test("Person starts isolating on earlier of positive symptoms and positive test date", () => {
  const [startDate, endDate] = computeIsolationPeriod(
    personWithPositiveSymptomsAndTest
  );
  expect(startDate).toStrictEqual(parseISO("2020-01-01"));
  expect(endDate).toStrictEqual(parseISO("2020-01-11"));
});

test("Person continues to isolate if symptoms have not improved in 24 hours", () => {
  const [, endDate] = computeIsolationPeriod(personWithOngoingSymptoms);
  expect(endDate).not.toStrictEqual(parseISO("2020-01-11"));

  const [, endDate2] = computeIsolationPeriod(
    personWithPositiveSymptomsAndTest
  );
  expect(endDate2).toStrictEqual(parseISO("2020-01-11"));
});

test("Person exposed outside the household quarantines for 14 days", () => {
  const calcluations = computeHouseHoldQuarantinePeriod(
    [personWithOutsideExposure],
    []
  );
  expect(calcluations[0].startDate).toStrictEqual(parseISO("2020-01-01"));
  expect(calcluations[0].endDate).toStrictEqual(parseISO("2020-01-15"));
});

test("Given a household with a person with a positive test and a caretaker, the caretaker quarantines for 24 days", () => {
  const inHouseExposureEvent = {
    contagiousPerson: personWithPositiveTest.id,
    quarantinedPerson: empty.id,
    exposed: true,
    ongoing: true,
    date: ""
  };
  const calcluations = computeHouseHoldQuarantinePeriod(
    [personWithPositiveTest, empty],
    [inHouseExposureEvent]
  );
  expect(calcluations[0].startDate).toStrictEqual(parseISO("2020-01-01"));
  expect(calcluations[1].startDate).toStrictEqual(parseISO("2020-01-01"));
  expect(calcluations[0].endDate).toStrictEqual(parseISO("2020-01-11"));
  expect(calcluations[1].endDate).toStrictEqual(parseISO("2020-01-25"));
});

test("Given a household with a person with a positive test and an isolated family member, the isolated family member quarantines for 14 days after last exposure", () => {
  const inHouseExposureEvent = {
    contagiousPerson: personWithPositiveTest.id,
    quarantinedPerson: empty.id,
    exposed: true,
    ongoing: false,
    date: "1/5/2020"
  };
  const calcluations = computeHouseHoldQuarantinePeriod(
    [personWithPositiveTest, empty],
    [inHouseExposureEvent]
  );
  expect(calcluations[0].startDate).toStrictEqual(parseISO("2020-01-01"));
  expect(calcluations[0].endDate).toStrictEqual(parseISO("2020-01-11"));
  expect(calcluations[1].startDate).toStrictEqual(parseISO("2020-01-01"));
  expect(calcluations[1].endDate).toStrictEqual(parseISO("2020-01-19"));
});

// TODO: Given a household with person A who has received a positive test and an person B who was exposed to person A and also another covid-positive person outside the household, person B quarantines for 14 days after latter exposure
