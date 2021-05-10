export interface PersonData {
  id: number;
  name: string;
  covidEvents: CovidEvents;
  noSymptomsFor24Hours: boolean;
  feelingSick: boolean;
  vaccinated: boolean;
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

export interface InHouseExposure {
  contagiousPerson: number;
  quarantinedPerson: number;
  exposed: boolean;
  ongoing: boolean;
  date: string;
}

export interface Exposure {
  startDate: Date;
  endDate: Date;
  infectionSource?: PersonData;
}

export interface Guidance {
  person: PersonData;
  infected: boolean;
  startDate?: Date;
  endDate?: Date;
  infectionSource?: PersonData;
  peopleWithOngoingExposureWithSymptoms?: string[];
}

export const colors = [
  "#b35806",
  "#e08214",
  "#fdb863",
  "#fee0b6",
  "#d8daeb",
  "#b2abd2",
  "#8073ac",
  "#542788"
];
