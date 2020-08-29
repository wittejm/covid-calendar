export interface HouseholdData {
  members: PersonData[];
}

export interface PersonData {
  name: string;
  covidEvents: CovidEvent[];
}

export interface CovidEvent {
  name: string;
}

export const LastExposure = {
  name: "Last Exposure"
};
export const NewSymptoms = {
  name: "New Symptoms"
};
export const SymptomsResolve = {
  name: "Symptoms Resolve"
};
export const PositiveTest = {
  name: "Positive Test"
};
export const NegativeTest = {
  name: "Negative Test"
};

export const AllEvents = [
  LastExposure,
  NewSymptoms,
  SymptomsResolve,
  PositiveTest,
  NegativeTest
];
