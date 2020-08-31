import { computeIsolationPeriod } from "./calculator";
import { PersonData } from "./types";
import { isValid } from "date-fns";

const kent: PersonData = {
  name: "Kent",
  covidEvents: {},
  isNewPerson: false,
  editing: false
};

test("Empty", () => {
  const date = computeIsolationPeriod(kent);
  expect(isValid(date)).toBe(false);
});
