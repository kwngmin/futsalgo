import { Prisma } from "@prisma/client";
import {
  allMatchesValidator,
  goalsValidator,
  matchDataValidator,
} from "./constants";

export type MatchWithDetails = Prisma.MatchGetPayload<
  typeof matchDataValidator
>;

export type AllMatchesData = Prisma.MatchGetPayload<
  typeof allMatchesValidator
>[];

export type GoalsData = Prisma.GoalRecordGetPayload<typeof goalsValidator>[];

export type MatchDataResult = {
  match: MatchWithDetails;
  allMatches: AllMatchesData;
  goals: GoalsData;
  matchOrder: number;
} | null;
