import { User } from './user';

export interface LoginResponse {
  token: string;
  user: User;
  data: [];
  role: string | null;
}

export interface UserData {
  fullName: string;
  email: string;
  role: string;
  token?: string;
  userID: string;
  skill?: string;
  position?: string;
  pushNotification: boolean;
  emailNotification: boolean;
  soundVibration: boolean;
  country?: string;
  city?: string;
  profileImg: string;
  about?: string;
  achievements: Achievement[];
  experience: Experience[];
  education: Education[];
  height?: string;
  weight?: string;
  bodyFat?: string;
  bmi?: string;
  maxHeart?: string;
  v02max?: string; 
  sprint?: string;
  vertical?: string
  agility?: string;
  sports?: string[];
  lookFor?: string[];
}

export interface AuthState {
  token: string | null;
  user: User | null;
  role: string | null;
  isLoading: boolean;
  error: string | null;
} 

export interface Achievement {
  title: string;
  date: string;
  sport: string;
  description: string;
  _id: string;
}

export interface Experience {
  title: string;
  date: string;
  sport: string;
  description: string;
  _id: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
  _id: string;
}