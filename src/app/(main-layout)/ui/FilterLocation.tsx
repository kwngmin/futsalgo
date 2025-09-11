"use client";

import { cityData } from "@/features/search-address-sgis/constants";
import CustomSelect from "@/shared/components/ui/custom-select";
import { cn } from "@/shared/lib/utils";
import { useCallback, useMemo, useState } from "react";
import { useDistricts } from "../home/lib/use-districts";

export interface LocationFilter {
  city: string;
  district?: string;
  label: string;
}

interface FilterLocationProps {
  onClose: () => void;
  setFilterValues: (values: { location?: LocationFilter }) => void;
}

const FilterLocation = ({ onClose, setFilterValues }: FilterLocationProps) => {
  const [selectedCity, setSelectedCity] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string>();

  // 선택된 도시의 코드 조회
  const selectedCityCode = useMemo(() => {
    return cityData.find((city) => city.addr_name === selectedCity)?.cd;
  }, [selectedCity]);

  // 시군구 데이터 조회
  const { data: districtsData, isLoading: isDistrictsLoading } =
    useDistricts(selectedCityCode);

  // 버튼 스타일 생성 함수 - 메모이제이션
  const createButtonClass = useCallback((isSelected: boolean) => {
    return cn(
      "cursor-pointer w-16 sm:w-24 h-9 sm:h-8 flex items-center justify-center rounded-sm sm:text-sm border transition-colors",
      isSelected
        ? "bg-white font-semibold border-gray-300 hover:border-gray-400 shadow-sm"
        : "text-muted-foreground font-medium hover:bg-gray-200 border-none hover:text-gray-600"
    );
  }, []);

  // 전체 버튼 스타일
  const allButtonClass = useMemo(
    () => createButtonClass(!selectedCity && !selectedDistrict),
    [selectedCity, selectedDistrict, createButtonClass]
  );

  // 저장/닫기 버튼 스타일
  const actionButtonClass = useMemo(() => {
    const hasSelection = selectedCity || selectedDistrict;
    return cn(
      "cursor-pointer font-semibold w-16 h-9 sm:h-8 flex items-center justify-center rounded-full sm:text-sm shrink-0 transition-colors",
      hasSelection
        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
        : "bg-gray-300/80 hover:bg-gray-300 text-gray-700"
    );
  }, [selectedCity, selectedDistrict]);

  // 이벤트 핸들러들 - 메모이제이션
  const handleSelectAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCity(undefined);
    setSelectedDistrict(undefined);
  }, []);

  const handleCityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const cityName = e.target.value;
      setSelectedCity(cityName);
      // 도시 변경 시 구/군 선택 초기화
      setSelectedDistrict(undefined);
    },
    []
  );

  const handleDistrictChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedDistrict(e.target.value);
    },
    []
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      // 선택된 값이 있으면 저장, 없으면 초기화
      if (selectedCity || selectedDistrict) {
        const locationFilter: LocationFilter = {
          city: selectedCity || "",
          district: selectedDistrict,
          label: `${selectedCity || "전체"}${
            selectedDistrict ? ` ${selectedDistrict}` : ""
          }`,
        };
        setFilterValues({ location: locationFilter });
      } else {
        setFilterValues({ location: undefined });
      }

      onClose();
    },
    [selectedCity, selectedDistrict, setFilterValues, onClose]
  );

  // 시도 옵션 - 메모이제이션
  const cityOptions = useMemo(
    () =>
      cityData.map((city) => (
        <option key={city.addr_name} value={city.addr_name}>
          {city.addr_name}
        </option>
      )),
    []
  );

  // 시군구 옵션 - 메모이제이션
  const districtOptions = useMemo(
    () =>
      districtsData?.result?.map((district) => (
        <option key={district.addr_name} value={district.addr_name}>
          {district.addr_name}
        </option>
      )) || [],
    [districtsData?.result]
  );

  return (
    <div className="flex items-center justify-between gap-2 mx-4 mt-3 bg-gray-100 rounded-md p-1">
      <div className="bg-gray-100 rounded flex items-center gap-1">
        <button
          type="button"
          onClick={handleSelectAll}
          className={allButtonClass}
          aria-label="전체 선택"
        >
          전체
        </button>

        <CustomSelect
          key={`city-${selectedCity}`}
          placeholder="시도 선택"
          className="w-36"
          size="sm"
          options={cityOptions}
          value={selectedCity || ""}
          onChange={handleCityChange}
          aria-label="시도 선택"
        />

        <CustomSelect
          key={`district-${selectedDistrict}`}
          disabled={!selectedCity || isDistrictsLoading}
          placeholder={isDistrictsLoading ? "로딩 중..." : "시군구 선택"}
          className="w-36"
          size="sm"
          options={districtOptions}
          value={selectedDistrict || ""}
          onChange={handleDistrictChange}
          aria-label="시군구 선택"
        />
      </div>

      <button
        type="button"
        onClick={handleClose}
        className={actionButtonClass}
        aria-label={selectedCity || selectedDistrict ? "저장" : "닫기"}
      >
        {selectedCity || selectedDistrict ? "저장" : "닫기"}
      </button>
    </div>
  );
};

export default FilterLocation;
