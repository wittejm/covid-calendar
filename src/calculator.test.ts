import {
  computeHouseHoldQuarantinePeriod,
  computeIsolationPeriod
} from "./calculator";
import { PersonData } from "./types";
import { isValid, parseISO } from "date-fns";

const empty: PersonData = {
  name: "Empty",
  covidEvents: {},
  isNewPerson: false,
  editing: false
};

const jordan: PersonData = {
  name: "Jordan",
  covidEvents: {
    SymptomsStart: parseISO("2020-01-01")
  },
  isNewPerson: false,
  editing: false
};

const kent: PersonData = {
  name: "Foo",
  covidEvents: {
    PositiveTest: parseISO("2020-01-01")
  },
  isNewPerson: false,
  editing: false
};

const personA: PersonData = {
  name: "Person A",
  covidEvents: {
    PositiveTest: parseISO("2020-01-01"),
    SymptomsStart: parseISO("2020-01-05")
  },
  isNewPerson: false,
  editing: false
};

const personB: PersonData = {
  name: "Person B",
  covidEvents: {
    PositiveTest: parseISO("2020-01-01"),
    SymptomsStart: parseISO("2020-01-05"),
    SymptomsEnd: parseISO("2020-01-11")
  },
  isNewPerson: false,
  editing: false
};

const personC: PersonData = {
  name: "Person C",
  covidEvents: {
    PositiveTest: parseISO("2020-01-01"),
    SymptomsStart: parseISO("2020-01-05"),
    SymptomsEnd: parseISO("2020-01-07")
  },
  isNewPerson: false,
  editing: false
};

const personD: PersonData = {
  name: "Person D",
  covidEvents: {
    InHouseExposure: { "Person A": parseISO("2020-01-05") }
  },
  isNewPerson: false,
  editing: false
};

const personE: PersonData = {
  name: "Person E",
  covidEvents: {
    PositiveTest: parseISO("2020-01-01"),
    InHouseExposure: { "Person D": parseISO("2020-01-05") }
  },
  isNewPerson: false,
  editing: false
};

test("Empty", () => {
  const date = computeIsolationPeriod(empty);
  expect(isValid(date)).toBe(false);
});

test("Isolation Period with one event", () => {
  const date = computeIsolationPeriod(jordan);
  expect(date).toStrictEqual(parseISO("2020-01-11"));

  const date2 = computeIsolationPeriod(kent);
  expect(date2).toStrictEqual(parseISO("2020-01-11"));
});

test("Isolation Period should use min of symptoms and positive test", () => {
  const date = computeIsolationPeriod(personA);
  expect(date).toStrictEqual(parseISO("2020-01-11"));
});

test("Isolation Period makes use of symptoms end", () => {
  const date = computeIsolationPeriod(personB);
  expect(date).toStrictEqual(parseISO("2020-01-12"));

  const date2 = computeIsolationPeriod(personC);
  expect(date2).toStrictEqual(parseISO("2020-01-11"));
});

test("Household calculation for one infected and one caretaker", () => {
  const calcluations = computeHouseHoldQuarantinePeriod([personA, empty]);
  expect(calcluations[0].date).toStrictEqual(parseISO("2020-01-11"));
  expect(calcluations[1].date).toStrictEqual(parseISO("2020-01-25"));
});

test("Household calculation for one infected and isolated peer", () => {
  const calcluations = computeHouseHoldQuarantinePeriod([personA, personD]);
  expect(calcluations[0].date).toStrictEqual(parseISO("2020-01-11"));
  expect(calcluations[1].date).toStrictEqual(parseISO("2020-01-19"));

  const calcluations2 = computeHouseHoldQuarantinePeriod([personE, personD]);
  expect(calcluations2[0].date).toStrictEqual(parseISO("2020-01-11"));
  expect(calcluations2[1].date).toStrictEqual(parseISO("2020-01-19"));
});
