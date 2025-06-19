import {
  Condition,
  Foot,
  Gender,
  PlayerBackground,
  PlayerSkillLevel,
  Position,
} from "@prisma/client";

export type Profile = {
  name?: string;
  foot?: Foot;
  gender?: Gender;
  position?: Position;
  birthDate?: string;
  playerBackground?: PlayerBackground;
  skillLevel?: PlayerSkillLevel;
  height?: number;
  weight?: number;
  image?: string;
  condition?: Condition;
};
