"use client";

import { FieldModal } from "@/app/(no-layout)/profile/ui/FieldModal";
import { Button } from "@/shared/components/ui/button";
import CustomSelect from "@/shared/components/ui/custom-select";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { MatchType } from "@prisma/client";
import { ArrowLeftRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const DURATION_OPTIONS = ["10", "15", "20"];

type Team = {
  id: string;
  name: string;
  logoUrl?: string | null;
};

const AddMatch = ({
  scheduleId,
  matchType,
  hostTeam,
  invitedTeam,
}: {
  scheduleId: string;
  matchType: MatchType;
  hostTeam: Team;
  invitedTeam?: Team;
}) => {
  const [duration, setDuration] = useState(DURATION_OPTIONS[0]);
  const [homeTeam, setHomeTeam] = useState(hostTeam);
  const [awayTeam, setAwayTeam] = useState(invitedTeam);
  //   const [isLoading, setIsLoading] = useState(false);
  console.log(scheduleId, "scheduleId");

  return (
    <FieldModal
      title="경기 추가"
      trigger={
        <div className="px-4 py-2">
          <Button
            type="button"
            className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
            size="lg"
          >
            경기 추가
          </Button>
        </div>
      }
    >
      <div className="space-y-6 my-2">
        <div className="space-y-3">
          <Label>시간</Label>
          <CustomSelect
            options={DURATION_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes}분
              </option>
            ))}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        {matchType === "TEAM" && awayTeam && (
          <div className="space-y-3">
            <Label>사이드</Label>
            <div className="flex justify-center items-stretch gap-2 sm:gap-3">
              <div className="flex flex-col items-center justify-center gap-2 border border-gray-100 rounded-md w-full min-w-24 grow">
                <div className="h-8 bg-green-500/10 w-full text-sm font-semibold flex items-center justify-center text-green-700">
                  HOME
                </div>
                <div className="flex flex-col items-center gap-2 pt-2 pb-4">
                  {homeTeam.logoUrl ? (
                    <Image
                      src={homeTeam.logoUrl}
                      alt="home-team-logo"
                      width={48}
                      height={48}
                      className="size-10 sm:size-12"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  )}
                  <span className="text-sm tracking-tight">
                    {homeTeam.name}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 w-12 sm:w-16 shrink-0">
                <div className="text-xl w-full h-8 flex items-center justify-center shrink-0 text-muted-foreground">
                  vs
                </div>
                <div
                  className="h-16 w-full flex items-center cursor-pointer hover:bg-gray-100 rounded-md p-3 justify-center font-semibold my-auto active:scale-95 transition-all duration-100"
                  onClick={() => {
                    setHomeTeam(awayTeam);
                    setAwayTeam(homeTeam);
                  }}
                >
                  <ArrowLeftRight className="size-4" />
                  {/* 바꾸기 */}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-2 border border-gray-100 rounded-md w-full min-w-24 grow">
                <div className="h-8 bg-blue-500/10 w-full text-sm font-semibold flex items-center justify-center text-blue-700">
                  AWAY
                </div>
                <div className="flex flex-col items-center gap-2 pt-2 pb-4">
                  {awayTeam.logoUrl ? (
                    <Image
                      src={awayTeam.logoUrl}
                      alt="away-team-logo"
                      width={48}
                      height={48}
                      className="size-10 sm:size-12"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  )}
                  <span className="text-sm tracking-tight">
                    {awayTeam.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button
          type="button"
          // onClick={handleClick}
          // disabled={phone.status !== "valid"}
        >
          저장
        </Button>
      </DialogFooter>
    </FieldModal>
  );
};

export default AddMatch;
