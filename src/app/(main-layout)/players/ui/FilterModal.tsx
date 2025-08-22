"use client";

import { DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Dispatch, SetStateAction, useState } from "react";

// 필터 옵션들
const filterOptions = [
  { id: "all", label: "전체" },
  { id: "MALE", label: "남자" },
  { id: "FEMALE", label: "여자" },
];

type FilterType = "all" | "MALE" | "FEMALE";

const FilterModal = ({
  filter,
  setFilter,
  onSuccess,
}: {
  filter?: string;
  setFilter: Dispatch<SetStateAction<FilterType>>;
  onSuccess: () => void;
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>(
    (filter as FilterType) || "all"
  );

  const handleClick = () => {
    setFilter(selectedFilter);
    onSuccess();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-between">
        <div className="w-full grid grid-cols-3 gap-1 bg-gray-100 rounded p-1">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedFilter(option.id as FilterType)}
              className={`px-4 py-1.5 text-sm font-medium rounded transition-colors cursor-pointer ${
                selectedFilter === option.id
                  ? "bg-slate-600 text-white font-bold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      {/* <div className="space-y-3">
        <Label htmlFor="phone">새로운 전화번호</Label>
        <div className="relative">
          <Input
            id="phone"
            type="tel"
            value={phone.value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="'-' 없이 입력해주세요 (ex. 01012345678)"
          />
          {phone.status === "checking" && (
            <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />
          )}
          {phone.status === "valid" && (
            <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />
          )}
          {phone.status === "invalid" && (
            <X className="absolute right-3 top-2.5 h-4 w-4 text-red-600" />
          )}
        </div>

        {phone.error && (
          <Alert variant="destructive" className="bg-destructive/5 border-none">
            <AlertDescription>{phone.error}</AlertDescription>
          </Alert>
        )}
      </div> */}
      <DialogFooter>
        <Button
          type="button"
          onClick={handleClick}
          // disabled={phone.status !== "valid"}
        >
          저장
        </Button>
      </DialogFooter>
    </div>
  );
};

export default FilterModal;
