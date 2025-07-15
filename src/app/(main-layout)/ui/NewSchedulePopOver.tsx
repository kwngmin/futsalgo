"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { Team } from "@prisma/client";
import { Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  console.log(teams, "teams");

  //   const {
  //     // register,
  //     // handleSubmit,
  //     formState: { errors },
  //     // setError,
  //     setValue,
  //     watch,
  //   } = useForm<NewScheduleFormData>({
  //     resolver: zodResolver(newScheduleFormSchema),
  //     defaultValues: {
  //       matchType: "SQUAD",
  //       hostTeamId: teams[0].id,
  //       invitedTeamCode: undefined,
  //     },
  //   });

  //   const { teamCode, onChange } = useTeamCodeValidation();

  if (teams.length === 1) {
    return (
      <Button
        className="rounded-full font-semibold py-0 !pl-3 !pr-4 text-base h-8"
        onClick={() => router.push(`/schedule/new/${teams[0].id}`)}
      >
        <Plus className="size-5 text-white" />
        일정
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="rounded-full font-semibold py-0 pl-2 pr-3 text-base h-8 gap-1 flex items-center bg-black text-white">
          <Plus className="size-5 text-white" />
          일정
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 px-0 py-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className="px-4 h-14 sm:h-12 hover:bg-gray-50 transition-colors cursor-pointer relative flex items-center gap-2"
            onClick={() => router.push(`/schedule/new/${team.id}`)}
          >
            {/* 팀 로고 */}
            <div className="size-8 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              {team.logoUrl ? (
                <Image
                  src={team.logoUrl}
                  alt={team.name}
                  width={32}
                  height={32}
                />
              ) : (
                <div className="size-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  {team.name.charAt(0)}
                </div>
              )}
            </div>

            {/* 팀 정보 */}
            <div className="flex flex-col items-start justify-center grow">
              <h3 className="sm:text-sm font-semibold flex items-center gap-2 truncate leading-none h-6">
                {team.name}
              </h3>
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default NewSchedulePopOver;
