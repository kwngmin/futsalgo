import { Prisma } from "@prisma/client";
import {
  allMatchesValidator,
  goalsValidator,
  goalsWithNameValidator,
  matchDataValidator,
  lineupsValidator,
  lineupsWithNameValidator,
} from "./constants";

export type MatchWithDetails = Prisma.MatchGetPayload<
  typeof matchDataValidator
>;

export type AllMatchesData = Prisma.MatchGetPayload<
  typeof allMatchesValidator
>[];

export type LineupsData = Prisma.LineupGetPayload<typeof lineupsValidator>[];

export type LineupsWithNameData = Prisma.LineupGetPayload<
  typeof lineupsWithNameValidator
>[];

export type GoalsData = Prisma.GoalRecordGetPayload<typeof goalsValidator>[];

export type GoalsWithNameData = Prisma.GoalRecordGetPayload<
  typeof goalsWithNameValidator
>[];

export type MatchPermissions = {
  isMember: boolean;
  isEditable: boolean;
};

export type MatchDataResult = {
  match: MatchWithDetails;
  lineups: LineupsData | LineupsWithNameData;
  allMatches: AllMatchesData;
  goals: GoalsData | GoalsWithNameData;
  matchOrder: number;
  permissions: MatchPermissions;
} | null;
