export type VehicleProfile = {
  year: number;
  make: string;
  model: string;
  mileage?: number;
  trim?: string;
  engine?: string;
  location?: string;
};

export type AssistantRequest = {
  vehicle: VehicleProfile;
  question: string;
};

export type AssistantResponse = {
  answer: string;
};
