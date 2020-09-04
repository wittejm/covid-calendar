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
    [CovidEventName.SymptomsEnd]: "",
    [CovidEventName.PositiveTest]: ""
  },
  isNewPerson: false,
  editing: false
};

const jordan: PersonData = {
  id: 1,
  name: "Jordan",
  covidEvents: {
    [CovidEventName.SymptomsStart]: "01/01/2020",
    [CovidEventName.LastCloseContact]: "",
    [CovidEventName.SymptomsEnd]: "",
    [CovidEventName.PositiveTest]: ""
  },
  isNewPerson: false,
  editing: false
};

const kent: PersonData = {
  id: 2,
  name: "Foo",
  covidEvents: {
    [CovidEventName.PositiveTest]: "01/01/2020",
    [CovidEventName.LastCloseContact]: "",
    [CovidEventName.SymptomsStart]: "",
    [CovidEventName.SymptomsEnd]: ""
  },
  isNewPerson: false,
  editing: false
};

const personA: PersonData = {
  id: 3,
  name: "Person A",
  covidEvents: {
    [CovidEventName.PositiveTest]: "01/01/2020",
    [CovidEventName.SymptomsStart]: "01/05/2020",
    [CovidEventName.LastCloseContact]: "",
    [CovidEventName.SymptomsEnd]: ""
  },
  isNewPerson: false,
  editing: false
};

const personB: PersonData = {
  id: 4,
  name: "Person B",
  covidEvents: {
    [CovidEventName.PositiveTest]: "01/01/2020",
    [CovidEventName.SymptomsStart]: "01/05/2020",
    [CovidEventName.SymptomsEnd]: "01/11/2020",
    [CovidEventName.LastCloseContact]: ""
  },
  isNewPerson: false,
  editing: false
};

const personC: PersonData = {
  id: 5,
  name: "Person C",
  covidEvents: {
    [CovidEventName.PositiveTest]: "01/01/2020",
    [CovidEventName.SymptomsStart]: "01/05/2020",
    [CovidEventName.SymptomsEnd]: "01/07/2020",
    [CovidEventName.LastCloseContact]: ""
  },
  isNewPerson: false,
  editing: false
};

test("Empty", () => {
  const [startDate, endDate] = computeIsolationPeriod(empty);
  expect(isValid(endDate)).toBe(false);
});

test("Isolation Period with one event", () => {
  const [startDate, endDate] = computeIsolationPeriod(jordan);
  expect(endDate).toStrictEqual(parseISO("2020-01-11"));

  const [startDate2, endDate2] = computeIsolationPeriod(kent);
  expect(endDate2).toStrictEqual(parseISO("2020-01-11"));
});

test("Isolation Period should use min of symptoms and positive test", () => {
  const [startDate, endDate] = computeIsolationPeriod(personA);
  expect(endDate).toStrictEqual(parseISO("2020-01-11"));
});

test("Isolation Period makes use of symptoms end", () => {
  const [startDate, endDate] = computeIsolationPeriod(personB);
  expect(endDate).toStrictEqual(parseISO("2020-01-12"));

  const [startDate2, endDate2] = computeIsolationPeriod(personC);
  expect(endDate2).toStrictEqual(parseISO("2020-01-11"));
});

test("Household calculation for one infected and one caretaker", () => {
  const inHouseExposureEvent = {
    contagiousPerson: personA.id,
    quarantinedPerson: empty.id,
    exposed: true,
    ongoing: true,
    date: ""
  };
  const calcluations = computeHouseHoldQuarantinePeriod(
    [personA, empty],
    [inHouseExposureEvent]
  );
  expect(calcluations[0].endDate).toStrictEqual(parseISO("2020-01-11"));
  expect(calcluations[1].endDate).toStrictEqual(parseISO("2020-01-25"));
});

test("Household calculation for one infected and isolated peer", () => {
  const inHouseExposureEvent = {
    contagiousPerson: personA.id,
    quarantinedPerson: empty.id,
    exposed: true,
    ongoing: false,
    date: "1/5/2020"
  };
  const calcluations = computeHouseHoldQuarantinePeriod(
    [personA, empty],
    [inHouseExposureEvent]
  );
  expect(calcluations[0].endDate).toStrictEqual(parseISO("2020-01-11"));
  expect(calcluations[1].endDate).toStrictEqual(parseISO("2020-01-19"));
});

// TODO: Add test for earliest exposure date
