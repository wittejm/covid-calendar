import { computeIsolationPeriod } from "./calculator";
import { Person } from "./types";

const kent: Person = {
  name: "Kent",
  covidEvents: []
};

test("Empty", () => {
  expect(computeIsolationPeriod(kent)).toBe(undefined);
});
