export interface Meet {
  id: number | string;
  name: string;
  location: string;
  organizer: string;
  startDate: string;
  endDate: string;
  medleyLivetimingPath?: string;
  numberOfLanes: number;
  numberOfPlates?: number;
  poolSize?: number;
  showHeatList?: boolean;
  showResultList?: boolean;
  showStartList?: boolean;
  showTimeSchedule?: boolean;
  meetLogoUrl?: string;
  countryCode?: string;
  source: "swimlane" | "swimify";
  isLive?: boolean;
  seoText?: string;
  largeImage?: string;
  smallImage?: string;
  nationCode?: string;
  poolName?: string;
  poolType?: number;
  city?: string;
}

export interface MeetEvent {
  eventNumber: number;
  medleyDistanceNumber: number;
  stroke: number;
  session: number;
  poolLength: number;
  relay: number;
  eventRound: number;
  antallHeat: number;
  alternatSession?: number;
  distanceText?: string;
  strokeText?: string;
  genderText?: string;
  gender?: number;
}

export interface Session {
  id: number;
  name: string;
  meetEvents: MeetEvent[];
}

export interface MeetDetails {
  name: string;
  location: string;
  organizer: string;
  startDate: string;
  endDate: string;
  medleyLivetimingPath: string;
  numberOfLanes: number;
  numberOfPlates?: number;
  adjustLaneNumbering?: number;
  sessions: Session[];
  meetLogoUrl?: string;
}

export interface Swimmer {
  id: number;
  birthYear?: number;
  birthText?: string;
  gender?: number;
  meetSwimmerNumber: number;
  lastName: string;
  firstName: string;
  countryName?: string;
  countryCode?: string;
  events?: string;
  meetSwimClubNumber: number;
  swimClubName: string;
  swimmerLogoUrl?: string;
  swimClubLogoUrl?: string;
}

export interface Club {
  id: number;
  name: string;
  shortName?: string;
  logoUrl?: string;
  countryCode?: string;
  swimmerCount: number;
  maleCount: number;
  femaleCount: number;
}

export interface LapTime {
  time?: number;
  step?: number;
  isSlower?: boolean;
}

export interface Race {
  id?: number;
  lane: number;
  heatNumber: number;
  eventNumber: number;
  numberOfLaps: number;
  meetSwimmerNumber?: number;
  lastName: string;
  firstName?: string;
  birthYear?: string;
  swimClubName?: string;
  estimatedFinalTime?: number;
  calculatedLapTimes?: LapTime[][];
  calculatedTeamNames?: { name: string; time?: number }[];
  place?: number;
  points?: number;
  round?: number;
  eventDate?: string;
  medleyDistanceNumber?: number;
  medleySwimClubNumber?: number;
  medleyMeetEntryNumber?: number;
  altRekkefolge?: number;
  speed?: number;
  estimatedLaps?: any[];
  updateId?: number;
  gender?: number;
}

export interface LiveRace extends Race {
  updateId: number;
  currentLap?: number;
  progress?: number;
}

export interface ScheduleEntry {
  session: number;
  lineNumber: number;
  headding?: number;
  generated?: string;
  time?: string;
  scheduleText: string;
  heatNumber?: number;
  heatNumberInSession?: number;
  meetEventNumber?: number;
}

export interface Document {
  title: string;
  link: string;
}

export interface DocumentGroup {
  heading: string;
  documents: Document[];
}

export interface MeetStats {
  totalSwimmers: number;
  maleSwimmers: number;
  femaleSwimmers: number;
  totalClubs: number;
  totalEvents: number;
}

export const STROKE_NAMES: Record<number, string> = {
  1: "Fri",
  2: "Rygg",
  3: "Bryst",
  4: "Butterfly",
  5: "Medley",
};

export const DISTANCE_NAMES: Record<number, string> = {
  1: "50m",
  2: "100m",
  3: "200m",
  4: "400m",
  5: "800m",
  6: "1500m",
  16: "50m",
  17: "100m",
  18: "200m",
  25: "4x50m",
  26: "4x100m",
};

export const POOL_LENGTH_NAMES: Record<number, string> = {
  2500: "25m",
  5000: "50m",
};

export const GENDER_NAMES: Record<number, string> = {
  1: "Herrer",
  2: "Damer",
  0: "Blandet",
  "-1": "Ukjent",
};

export function formatTime(milliseconds: number): string {
  if (!milliseconds || milliseconds <= 0) return "--:--:--";
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const ms = Math.floor((milliseconds % 1000) / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  }
  return `${seconds}.${ms.toString().padStart(2, "0")}`;
}

export function getEventName(event: MeetEvent): string {
  const distance = DISTANCE_NAMES[event.medleyDistanceNumber] || `${event.medleyDistanceNumber}`;
  const stroke = STROKE_NAMES[event.stroke] || "Ukjent";
  return `${distance} ${stroke}`;
}

export function getPoolLengthName(poolLength: number): string {
  return POOL_LENGTH_NAMES[poolLength] || `${poolLength / 100}m`;
}

export function getGenderName(gender: number): string {
  return GENDER_NAMES[gender] || "Ukjent";
}

export function getGenderIcon(gender: number): string {
  if (gender === 1) return "M";
  if (gender === 2) return "K";
  return "?";
}

export function isRelay(event: MeetEvent): boolean {
  return event.relay > 0 || event.medleyDistanceNumber >= 25;
}

export function isMeetLive(startDate: string, endDate: string): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  return now >= start && now <= end;
}

export function getMeetStatus(startDate: string, endDate: string): "upcoming" | "live" | "finished" {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  if (now < start) return "upcoming";
  if (now > end) return "finished";
  return "live";
}
