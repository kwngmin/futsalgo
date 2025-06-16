import {
  Condition,
  Foot,
  Gender,
  PlayerBackground,
  Position,
  SkillLevel,
} from "@prisma/client";

export type Profile = {
  name?: string;
  foot?: Foot;
  gender?: Gender;
  position?: Position;
  birthDate?: string;
  playerBackground?: PlayerBackground;
  skillLevel?: SkillLevel;
  height?: number;
  weight?: number;
  image?: string;
  condition?: Condition;
};
