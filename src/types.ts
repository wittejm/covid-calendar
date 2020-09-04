export interface PersonData {
  id: number;
  name: string;
  covidEvents: CovidEvents;
  isNewPerson: boolean;
  editing: boolean;
}

export enum CovidEventName {
  LastCloseContact = "Most Recent Close Contact",
  SymptomsStart = "Illness Onset",
  SymptomsEnd = "Most Recent Symptoms",
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
}

export interface CalculationResult {
  person: PersonData;
  startDate: Date;
  endDate: Date;
  infected?: boolean;
}
