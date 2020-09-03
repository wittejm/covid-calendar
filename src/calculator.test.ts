import {
  computeHouseHoldQuarantinePeriod,
  computeIsolationPeriod
} from "./calculator";
import { PersonData } from "./types";
import { isValid, parseISO } from "date-fns";

const empty: PersonData = {
  id: 0,
  name: "Empty",
  covidEvents: {},
  isNewPerson: false,
  editing: false
};

const jordan: PersonData = {
  id: 0,
  name: "Jordan",
  covidEvents: {
    SymptomsStart: "01/01/2020"
  },
  isNewPerson: false,
  editing: false
};

const kent: PersonData = {
  id: 0,
  name: "Foo",
  covidEvents: {
    PositiveTest: "01/01/2020"
  },
  isNewPerson: false,
  editing: false
};

const personA: PersonData = {
  id: 0,
  name: "Person A",
  covidEvents: {
    PositiveTest: "01/01/2020",
    SymptomsStart: "01/05/2020"
  },
  isNewPerson: false,
  editing: false
};

const personB: PersonData = {
  id: 0,
  name: "Person B",
  covidEvents: {
    PositiveTest: "01/01/2020",
    SymptomsStart: "01/05/2020",
    SymptomsEnd: "01/11/2020"
  },
  isNewPerson: false,
  editing: false
};

const personC: PersonData = {
  id: 0,
  name: "Person C",
  covidEvents: {
    PositiveTest: "01/01/2020",
    SymptomsStart: "01/05/2020",
    SymptomsEnd: "01/07/2020"
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
    contagiousPerson: personA,
    quarantinedPerson: empty,
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
    contagiousPerson: personA,
    quarantinedPerson: empty,
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
