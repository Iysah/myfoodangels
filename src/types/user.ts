import { Education, Experience } from "./auth";

export enum UserRole {
  ATHLETE = 'Athlete',
  SCOUT = 'Scout',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  accountType: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AthleteProfile {
  name: string;
  email: string;
  about: string;
  location: {
    city: string;
    country: string;
  };
  sport: string;
  position: string;
  skill: string;
  statistic?: {
    height: string;
    weight: string;
    bodyFat: string;
    bmi: string;
    maxHeart: string;
    v02max: string;
    sprint: string;
    vertical: string;
    agility: string;
  };
  achievement?: Achievement[];
  experience?: Experience[];
  education?: Education[];
  videos?: Video[];
}

export interface ScoutProfile {
  _id: string;
  email: string;
  name: string;
  accountType: string;
  emailVerified: boolean;
  pushNotification: boolean;
  emailNotification: boolean;
  soundVibration: boolean;
  position?: string;
  location?: {
    country: string;
    city: string;
    _id: string;
  };
  profileImg?: string;
  about?: string;
  title?: string;
  sports?: string[];
  lookFor?: string[];
  accountStatus: string;
  updatedAt: string;
  createdAt: string;
}

export interface AthleteStats {
  goals?: number;
  assists?: number;
  appearances?: number;
  yellowCards?: number;
  redCards?: number;
  [key: string]: any;
}

export interface Achievement {
  _id: string;
  title: string;
  description: string;
  sport: string;
  date: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
} 

export interface SearchFilters {
  category?: string;
  location?: string;
  sportType?: string;
  eligibility?: string;
}