import { computeIsolationPeriod } from "./calculator";
import { PersonData } from "./types";

const kent: PersonData = {
  name: "Kent",
  covidEvents: [],
  isNewPerson: false
};

test("Empty", () => {
  expect(computeIsolationPeriod(kent)).toBe(undefined);
});
