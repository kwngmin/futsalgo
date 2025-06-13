import { Condition, Foot, Gender, Position } from "@prisma/client";

export type Profile = {
  name?: string;
  foot?: Foot;
  gender?: Gender;
  positions?: Position[];
  birthYear?: number;
  height?: number;
  weight?: number;
  image?: string;
  condition?: Condition;
};
