"use client";

import { FieldModal } from "@/app/(no-layout)/profile/ui/FieldModal";
import { LineupsData, LineupsWithNameData } from "@/entities/match/model/types";
import { Button } from "@/shared/components/ui/button";
import CustomSelect from "@/shared/components/ui/custom-select";
import { DialogFooter } from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod/v4";
import { createGoalRecord } from "../actions/create-goal-record";

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
        message: "골 넣은 선수 또는 용병을 선택해주세요",
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
      scorerSide: "HOME",
    },
  });

  console.log(watch("scorerId"));

  const watchValues = watch();
  const { isOwnGoal, isScoredByMercenary, isAssistedByMercenary } = watchValues;

  // HOME과 AWAY 팀 라인업 분리
  const homeLineups = lineups.filter((lineup) => lineup.side === "HOME");
  const awayLineups = lineups.filter((lineup) => lineup.side === "AWAY");

  const onSubmit: SubmitHandler<GoalRecordFormData> = async (data) => {
    try {
      await createGoalRecord(matchId, data);
      alert("골이 기록되었습니다!");
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <FieldModal
      title="골 기록"
      trigger={
        <div className="p-4">
          <Button
            type="button"
            className="w-full font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 tracking-tight !h-12 !text-lg"
            size="lg"
          >
            GOAL !
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 my-2">
        {/* 어느 팀 득점인지 선택 */}
        <div className="space-y-3">
          <Label>득점 팀</Label>
          <CustomSelect
            value={watchValues.scorerSide}
            onChange={(e) =>
              setValue("scorerSide", e.target.value as "HOME" | "AWAY")
            }
            options={
              <>
                <option value="HOME">HOME 팀</option>
                <option value="AWAY">AWAY 팀</option>
              </>
            }
          />
        </div>

        {/* 득점 한 사람 */}
        <div className="space-y-3">
          <div className="flex justify-between gap-3">
            <Label>득점 한 사람</Label>
            <div className="flex items-center gap-6">
              {/* 자책골 여부 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOwnGoal"
                  checked={isOwnGoal}
                  onCheckedChange={(checked) => {
                    setValue("isOwnGoal", !!checked);
                    if (checked) {
                      // 자책골일 때 어시스트 관련 필드 초기화
                      setValue("assistId", "");
                      setValue("isAssistedByMercenary", false);
                    }
                  }}
                />
                <Label htmlFor="isOwnGoal">자책골</Label>
              </div>

              {/* 용병 체크박스 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isScoredByMercenary"
                  checked={isScoredByMercenary}
                  onCheckedChange={(checked) => {
                    setValue("isScoredByMercenary", !!checked);
                    if (checked) {
                      setValue("scorerId", "");
                    }
                  }}
                />
                <Label htmlFor="isScoredByMercenary">용병</Label>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {/* 선수 선택 (용병이 아닐 때만) */}
            {!isScoredByMercenary && (
              <CustomSelect
                value={watchValues.scorerId || ""}
                onChange={(e) => setValue("scorerId", e.target.value)}
                options={
                  <>
                    <option value="">선택</option>
                    {watchValues.scorerSide === "HOME"
                      ? homeLineups.map((lineup) => (
                          <option key={lineup.id} value={lineup.userId}>
                            {`${lineup.user.nickname} ${
                              "name" in lineup.user
                                ? `(${lineup.user.name})`
                                : ""
                            }`}
                          </option>
                        ))
                      : awayLineups.map((lineup) => (
                          <option key={lineup.id} value={lineup.userId}>
                            {`${lineup.user.nickname} ${
                              "name" in lineup.user
                                ? `(${lineup.user.name})`
                                : ""
                            }`}
                          </option>
                        ))}
                  </>
                }
              />
            )}
          </div>
          {errors.scorerId && (
            <p className="text-sm text-red-500">{errors.scorerId.message}</p>
          )}
        </div>

        {/* 어시스트 (자책골이 아닐 때만) */}
        {!isOwnGoal && (
          <div className="space-y-3">
            <div className="flex justify-between gap-3">
              <Label>어시스트 한 사람</Label>
              {/* 어시스트 용병 체크박스 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAssistedByMercenary"
                  checked={isAssistedByMercenary}
                  onCheckedChange={(checked) => {
                    setValue("isAssistedByMercenary", !!checked);
                    if (checked) {
                      setValue("assistId", "");
                    }
                  }}
                />
                <Label htmlFor="isAssistedByMercenary">용병</Label>
              </div>
            </div>
            <div className="space-y-3">
              {/* 어시스트 선수 선택 (용병이 아닐 때만) */}
              {!isAssistedByMercenary && (
                <CustomSelect
                  value={watchValues.assistId || ""}
                  onChange={(e) => setValue("assistId", e.target.value)}
                  options={
                    <>
                      <option value="">없음</option>
                      {watchValues.scorerSide === "HOME"
                        ? homeLineups
                            .filter(
                              (lineup) => lineup.userId !== watch("scorerId")
                            )
                            .map((lineup) => (
                              <option key={lineup.id} value={lineup.userId}>
                                {`${lineup.user.nickname} ${
                                  "name" in lineup.user
                                    ? `(${lineup.user.name})`
                                    : ""
                                }`}
                              </option>
                            ))
                        : awayLineups
                            .filter(
                              (lineup) => lineup.userId !== watch("scorerId")
                            )
                            .map((lineup) => (
                              <option key={lineup.id} value={lineup.userId}>
                                {`${lineup.user.nickname} ${
                                  "name" in lineup.user
                                    ? `(${lineup.user.name})`
                                    : ""
                                }`}
                              </option>
                            ))}
                    </>
                  }
                />
              )}
            </div>
            {errors.assistId && (
              <p className="text-sm text-red-500">{errors.assistId.message}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </form>
    </FieldModal>
  );
};

export default GoalRecord;
