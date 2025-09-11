"use client";

import { cityData } from "@/features/search-address-sgis/constants";
import CustomSelect from "@/shared/components/ui/custom-select";
import { cn } from "@/shared/lib/utils";
// import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useDistricts } from "../home/lib/use-districts";

export interface LocationFilter {
  city: string;
  district?: string;
  label: string;
}

const FilterLocation = ({
  onClose,
  setFilterValues,
}: {
  onClose: () => void;
  setFilterValues: (values: { location?: LocationFilter }) => void;
}) => {
  const [city, setCity] = useState<string>();
  const [cd, setCd] = useState<string>();
  console.log(city, "city");
  console.log(cd, "cd");

  const { data: districts, isLoading } = useDistricts(cd);
  console.log(districts, "districts");
  console.log(isLoading, "isLoading");

  const [district, setDistrict] = useState<string>();

  // 데이터 조회 - 최적화된 설정
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["location", city?.cd],
  //   queryFn: () => getDistricts(city?.cd),
  //   placeholderData: keepPreviousData,
  //   staleTime: 1000 * 60 * 2, // 2분간 fresh 상태 유지
  //   gcTime: 1000 * 60 * 10, // 10분간 가비지 컬렉션 방지
  //   refetchOnWindowFocus: false, // 윈도우 포커스 시 재조회 방지
  // });

  // 버튼 클래스 생성 함수 메모이제이션
  const getButtonClass = useCallback((isSelected: boolean) => {
    return cn(
      "cursor-pointer w-16 sm:w-24 h-9 sm:h-8 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
      isSelected
        ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
        : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
    );
  }, []);

  // 전체 버튼 클래스 메모이제이션
  const allButtonClass = useMemo(
    () => getButtonClass(city === undefined && district === undefined),
    [city, district, getButtonClass]
  );

  // 전체 선택 핸들러 메모이제이션
  const handleSelectAll = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCity(undefined);
      setDistrict(undefined);
    },
    [setCity, setDistrict]
  );

  // 닫기 핸들러 메모이제이션
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // if (city !== undefined && district !== undefined) {
      //   setFilterValues({ location: { city, district } });
      // }
      setFilterValues({ location: undefined });
      onClose();
    },
    [onClose, setFilterValues]
  );

  return (
    <div className="flex items-center justify-between gap-2 mx-4 mt-3 bg-gray-100 rounded-md p-1">
      <div className="bg-gray-100 rounded flex items-center gap-1">
        <div onClick={handleSelectAll} className={allButtonClass}>
          전체
        </div>
        <CustomSelect
          key={city}
          // hasPlaceholder
          placeholder="시도 선택"
          className="w-36"
          size="sm"
          options={cityData.map((city) => (
            <option key={city.addr_name} value={city.addr_name}>
              {city.addr_name}
            </option>
          ))}
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setCd(
              cityData.find((city) => city.addr_name === e.target.value)?.cd
            );
          }}
        />
        <CustomSelect
          key={district}
          disabled={!city}
          placeholder="시군구 선택"
          className="w-36"
          size="sm"
          options={districts?.result?.map(
            (district: { cd: string; addr_name: string }) => (
              <option key={district.addr_name} value={district.addr_name}>
                {district.addr_name}
              </option>
            )
          )}
          value={district}
          onChange={(e) => {
            setDistrict(e.target.value);
          }}
        />
      </div>

      <div
        onClick={handleClose}
        className={`cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 ${
          city === undefined && district === undefined
            ? "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {city === undefined && district === undefined ? "닫기" : "저장"}
      </div>
    </div>
  );
};

export default FilterLocation;
