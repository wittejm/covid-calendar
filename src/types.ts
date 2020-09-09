export interface PersonData {
  id: number;
  name: string;
  covidEvents: CovidEvents;
  noSymptomsFor24Hours: boolean;
  isNewPerson: boolean;
  editing: boolean;
}

export enum CovidEventName {
  LastCloseContact = "Most Recent Close Contact",
  SymptomsStart = "Illness Onset",
  PositiveTest = "Most Recent Positive Test"
}

export type CovidEvents = {
  [key in CovidEventName]: string;
};

export interface InHouseExposureEvent {
  contagiousPerson: number;
  quarantinedPerson: number;
  exposed: boolean;
  ongoing: boolean;
  date: string;
  dateMissing: boolean;
  dateInvalid: boolean;
}

export interface CalculationResult {
  person: PersonData;
  startDate: Date;
  endDate: Date;
  infected?: boolean;
}

export const colors = [
  "#91DADF", // bg-light-green",
  "#96CCFF", // bg-light-blue
  "#A463F2", // bg-light-purple
  "#FF6300" // bg-orange
];
export const colorNames = [
  "bg-light-green",
  "bg-light-blue",
  "bg-light-purple",
  "bg-orange"
];
