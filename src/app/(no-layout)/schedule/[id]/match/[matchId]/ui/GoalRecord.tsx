"use client";

import { LineupsData, LineupsWithNameData } from "@/entities/match/model/types";
import { Button } from "@/shared/components/ui/button";
import CustomSelect from "@/shared/components/ui/custom-select";
import { Label } from "@/shared/components/ui/label";
// import { Checkbox } from "@/shared/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod/v4";
import { createGoalRecord } from "../actions/create-goal-record";
import { useMemo } from "react";
import { Switch } from "@/shared/components/ui/switch";
import { SneakerMoveIcon, SoccerBallIcon } from "@phosphor-icons/react";
import { ClipboardPenLine } from "lucide-react";

export const goalRecordSchema = z
  .object({
    scorerId: z.string().optional(),
    assistId: z.string().optional(),
    isOwnGoal: z.boolean(),
    isScoredByMercenary: z.boolean(),
    isAssistedByMercenary: z.boolean(),
    scorerSide: z.enum(["HOME", "AWAY"]),
  })
  .superRefine((data, ctx) => {
    // scorerId나 isScoredByMercenary 둘 중 하나는 반드시 있어야 함
    if (!data.scorerId && !data.isScoredByMercenary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "득점한 사람 또는 용병을 선택해주세요",
        path: ["scorerId"],
      });
    }

    // scorerId와 isScoredByMercenary 둘 다 있으면 안됨
    if (data.scorerId && data.isScoredByMercenary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "골 넣은 선수와 용병 중 하나만 선택해주세요",
        path: ["isScoredByMercenary"],
      });
    }

    // 자책골일 때는 assistId나 isAssistedByMercenary가 있으면 안됨
    if (data.isOwnGoal) {
      if (data.assistId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "자책골에는 어시스트가 있을 수 없습니다",
          path: ["assistId"],
        });
      }
      if (data.isAssistedByMercenary) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "자책골에는 어시스트가 있을 수 없습니다",
          path: ["isAssistedByMercenary"],
        });
      }
    }

    // assistId와 isAssistedByMercenary 둘 다 있으면 안됨
    if (data.assistId && data.isAssistedByMercenary) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "어시스트 선수와 용병 중 하나만 선택해주세요",
        path: ["isAssistedByMercenary"],
      });
    }
  });

export type GoalRecordFormData = z.infer<typeof goalRecordSchema>;

const GoalRecord = ({
  matchId,
  lineups,
}: {
  matchId: string;
  lineups: LineupsData | LineupsWithNameData;
}) => {
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<GoalRecordFormData>({
    resolver: zodResolver(goalRecordSchema),
    defaultValues: {
      isOwnGoal: false,
      isScoredByMercenary: false,
      isAssistedByMercenary: false,
    },
  });

  const watchValues = watch();
  const {
    isOwnGoal,
    scorerId,
    isScoredByMercenary,
    scorerSide,
    assistId,
    isAssistedByMercenary,
  } = watchValues;

  // HOME과 AWAY 팀 라인업 분리
  const { homeLineups, awayLineups } = useMemo(
    () => ({
      homeLineups: lineups.filter((lineup) => lineup.side === "HOME"),
      awayLineups: lineups.filter((lineup) => lineup.side === "AWAY"),
    }),
    [lineups]
  );

  // 득점자 select의 현재 value 계산
  const scorerSelectValue = useMemo(() => {
    if (scorerId) return scorerId;
    if (isScoredByMercenary && scorerSide === "HOME")
      return "mercenary_home_side";
    if (isScoredByMercenary && scorerSide === "AWAY")
      return "mercenary_away_side";
    return "";
  }, [scorerId, isScoredByMercenary, scorerSide]);

  // 어시스트 select의 현재 value 계산
  const assistSelectValue = useMemo(() => {
    if (assistId) return assistId;
    if (isAssistedByMercenary) return "mercenary_assist";
    return "";
  }, [assistId, isAssistedByMercenary]);

  const handleScorerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "mercenary_home_side") {
      setValue("isScoredByMercenary", true);
      setValue("scorerId", "");
      setValue("scorerSide", "HOME");
    } else if (value === "mercenary_away_side") {
      setValue("isScoredByMercenary", true);
      setValue("scorerId", "");
      setValue("scorerSide", "AWAY");
    } else {
      setValue("isScoredByMercenary", false);
      setValue("scorerId", value);

      if (value) {
        const selectedLineup = lineups.find(
          (lineup) => lineup.userId === value
        );
        if (selectedLineup) {
          setValue("scorerSide", selectedLineup.side as "HOME" | "AWAY");
        }
      }
    }
  };

  const handleAssistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "mercenary_assist") {
      setValue("isAssistedByMercenary", true);
      setValue("assistId", "");
    } else {
      setValue("isAssistedByMercenary", false);
      setValue("assistId", value);
    }
  };

  const handleOwnGoalChange = (checked: boolean | "indeterminate") => {
    setValue("isOwnGoal", !!checked);
    if (checked) {
      // 자책골일 때 어시스트 관련 필드 초기화
      setValue("assistId", "");
      setValue("isAssistedByMercenary", false);
      setValue("scorerSide", scorerSide === "HOME" ? "AWAY" : "HOME");
    } else {
      setValue("scorerSide", scorerSide);
    }
  };

  const onSubmit: SubmitHandler<GoalRecordFormData> = async (data) => {
    try {
      await createGoalRecord(matchId, data);
      alert("골이 기록되었습니다!");
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const renderPlayerOptions = (
    teamLineups: typeof homeLineups,
    excludeUserId?: string
  ) =>
    teamLineups
      .filter((lineup) => lineup.userId !== excludeUserId)
      .map((lineup) => (
        <option key={lineup.id} value={lineup.userId}>
          {`${lineup.user.nickname} ${
            "name" in lineup.user ? `(${lineup.user.name})` : ""
          }`}
        </option>
      ));

  console.log(watchValues.scorerId, "watchValues.scorerId");
  console.log(
    watchValues.isScoredByMercenary,
    "watchValues.isScoredByMercenary"
  );

  console.log(
    Boolean(watchValues.scorerId || watchValues.isScoredByMercenary),
    "watchValues.scorerId || watchValues.isScoredByMercenary"
  );

  return (
    <div className="px-4">
      <div className="w-full flex items-center justify-between h-14 sm:h-11 gap-3">
        <div className="flex items-center gap-2">
          <ClipboardPenLine className="size-5 text-gray-600" />
          <span className="text-base font-medium">골 & 어시스트 기록</span>
        </div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 p-4 bg-gray-50 rounded-md"
      >
        {/* 득점 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <SoccerBallIcon className="size-4" weight="fill" />
            <Label>골 넣은 사람</Label>
          </div>
          <div className="space-y-3">
            <CustomSelect
              // value={watchValues.scorerId || ""}
              value={scorerSelectValue}
              onChange={handleScorerChange}
              options={
                <>
                  <option value="">선택</option>
                  <optgroup label={`HOME`}>
                    {renderPlayerOptions(homeLineups)}
                    <option value="mercenary_home_side">용병</option>
                  </optgroup>
                  <optgroup label="AWAY">
                    {renderPlayerOptions(awayLineups)}
                    <option value="mercenary_away_side">용병</option>
                  </optgroup>
                </>
              }
            />

            {/* 자책골 여부 */}
            {Boolean(scorerId || isScoredByMercenary) && (
              <div className="flex justify-between items-center space-x-2 h-11 bg-white rounded-md px-2">
                <div className="flex items-center gap-2 px-1">
                  <SoccerBallIcon
                    className="size-4 text-destructive"
                    weight="fill"
                  />
                  <Label htmlFor="isOwnGoal">자책골</Label>
                </div>
                <Switch
                  id="isOwnGoal"
                  checked={isOwnGoal}
                  onCheckedChange={handleOwnGoalChange}
                  className="scale-125 sm:scale-110"
                />
              </div>
            )}
          </div>

          {errors.scorerId && (
            <p className="text-sm text-red-500">{errors.scorerId.message}</p>
          )}
        </div>

        {/* 어시스트 (자책골이 아닐 때만) */}
        {!isOwnGoal && Boolean(scorerId || isScoredByMercenary) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SneakerMoveIcon className="size-4" weight="fill" />
              <Label>어시스트 한 사람</Label>
            </div>
            <div className="space-y-3">
              <CustomSelect
                // value={watchValues.assistId || ""}
                value={assistSelectValue}
                onChange={handleAssistChange}
                options={
                  <>
                    <option value="">없음</option>
                    {scorerSide === "HOME"
                      ? renderPlayerOptions(homeLineups, scorerId)
                      : renderPlayerOptions(awayLineups, scorerId)}
                    <option value="mercenary_assist">용병</option>
                  </>
                }
              />
            </div>
            {errors.assistId && (
              <p className="text-sm text-red-500">{errors.assistId.message}</p>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          // type="button"
          className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
          size="lg"
        >
          {/* GOAL ! */}
          {isSubmitting ? "저장하는 중..." : "저장"}
        </Button>
      </form>
    </div>
  );
};

export default GoalRecord;
