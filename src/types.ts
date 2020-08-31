export interface PersonData {
  name: string;
  covidEvents: CovidEvents;
  isNewPerson: boolean;
  editing: boolean;
}

export enum CovidEventName {
  LastCloseContact = "Most Recent Close Contact",
  SymptomsStart = "Illness Onset",
  SymptomsEnd = "Most Recent Symptoms",
  PositiveTest = "Most Recent Positive Test",
  NegativeTest = "Most Recent Negative Test",
  InHouseExposure = "In-house Exposure"
}

export interface CovidEvents {
  LastCloseContact?: Date;
  SymptomsStart?: Date;
  SymptomsEnd?: Date;
  PositiveTest?: Date;
  NegativeTest?: Date;
  InHouseExposure?: InHouseExposureEvents;
}

export interface InHouseExposureEvents {
  [personName: string]: Date;
}

export interface CalculationResult {
  person: PersonData;
  date: Date;
  infected?: boolean;
}
