import { Moment } from "moment";

export interface Person {
  name: string;
  covidEvents: CovidEvent[];
}

export interface CovidEvent {
  name: CovidEventName;
  date: Moment;
}

export enum CovidEventName {
  LastCloseContact = "Most Recent Close Contact",
  SymptomsStart = "Illness Onset",
  SymptomsEnd = "Most Recent Symptoms",
  PositiveTest = "Most Recent Positive Test",
  NegativeTest = "Most Recent Negative Test"
}

export interface CalculationResult {
  person: Person;
  date: Moment;
}
