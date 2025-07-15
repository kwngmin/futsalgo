"use client";

import { MATCH_TYPE_OPTIONS } from "@/entities/schedule/model/constants";
import { useTeamCodeValidation } from "@/features/validation/hooks/use-validation";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import CustomRadioGroup from "@/shared/components/ui/custom-radio-group";
import CustomSelect from "@/shared/components/ui/custom-select";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { MatchType, Team } from "@prisma/client";
import { Check, Loader2, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";

export const newScheduleFormSchema = z.object({
  // name: z.string().min(1, "팀 이름을 입력해주세요"),
  matchType: z.enum(["SQUAD", "TEAM"], {
    error: () => "경기 타입을 선택해주세요",
  }),
  hostTeamId: z.string({
    error: () => "팀을 선택해주세요",
  }),
  invitedTeamCode: z.string().optional(),
});

export type NewScheduleFormData = z.infer<typeof newScheduleFormSchema>;

const NewSchedulePopOver = ({ teams }: { teams: Team[] }) => {
  //   const router = useRouter();
  console.log(teams, "teams");

  const {
    // register,
    // handleSubmit,
    formState: { errors },
    // setError,
    setValue,
    watch,
  } = useForm<NewScheduleFormData>({
    resolver: zodResolver(newScheduleFormSchema),
    defaultValues: {
      matchType: "SQUAD",
      hostTeamId: teams[0].id,
      invitedTeamCode: undefined,
    },
  });

  const { teamCode, onChange } = useTeamCodeValidation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="rounded-full font-semibold py-0 !pl-3 !pr-4 text-base h-8"
          //   onClick={() =>
          //     router.push(`/schedule/new/${data?.data?.manageableTeams[0].id}`)
          //   }
        >
          <Plus className="size-5 text-white" />
          일정
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Dimensions</h4>
            <p className="text-muted-foreground text-sm">
              Set the dimensions for the layer.
            </p>
          </div>
          <div className="grid gap-6">
            <div className="space-y-3">
              <Label className="px-1">주최팀</Label>
              <CustomSelect
                hasPlaceholder
                options={teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
                value={watch("hostTeamId")}
                onChange={(e) => setValue("hostTeamId", e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <Label className="px-1">팀 실력</Label>
              <CustomRadioGroup
                options={MATCH_TYPE_OPTIONS}
                value={watch("matchType")}
                onValueChange={(value) =>
                  setValue("matchType", value as MatchType)
                }
                error={errors.matchType?.message}
                direction="vertical"
              />
            </div>
            {watch("matchType") === "TEAM" && (
              <div className="space-y-3">
                <Label htmlFor="teamCode">초청팀 팀 코드</Label>
                <div className="relative">
                  <Input
                    id="teamCode"
                    value={teamCode.value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="예) 123456"
                  />
                  {teamCode.status === "checking" && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
                  )}
                  {teamCode.status === "valid" && (
                    <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
                  )}
                  {teamCode.status === "invalid" && (
                    <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
                  )}
                </div>
                {teamCode.error && (
                  <Alert
                    variant="destructive"
                    className="bg-destructive/5 border-none"
                  >
                    <AlertDescription>{teamCode.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NewSchedulePopOver;
