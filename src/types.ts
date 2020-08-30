import moment, { Moment } from "moment";

export interface PersonData {
  name: string;
  covidEvents: CovidEvent[];
  isNewPerson: boolean;
  editing: boolean;
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
  person: PersonData;
  date: Moment;
}
