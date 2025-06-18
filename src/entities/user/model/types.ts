import {
  Condition,
  Foot,
  Gender,
  PlayerBackground,
  FootballPosition,
  FutsalPosition,
  SkillLevel,
  SportType,
} from "@prisma/client";

export type Profile = {
  name?: string;
  foot?: Foot;
  gender?: Gender;
  sportType?: SportType;
  futsalPosition?: FutsalPosition;
  footballPositions?: FootballPosition[];
  birthDate?: string;
  playerBackground?: PlayerBackground;
  skillLevel?: SkillLevel;
  height?: number;
  weight?: number;
  image?: string;
  condition?: Condition;
};
