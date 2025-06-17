"use client";

import { useState } from "react";
import { Camera, Upload, MapPin } from "lucide-react";

const TeamsCreatePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    city: "",
    district: "",
    gender: "MIXED",
    activityFrequency: "WEEKLY",
    logoUrl: "",
    coverUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 여기에 팀 생성 API 호출 로직 추가
      console.log("팀 생성 데이터:", formData);

      // 성공 시 리다이렉트 또는 성공 메시지
      alert("팀이 성공적으로 생성되었습니다!");
    } catch (error) {
      console.error("팀 생성 실패:", error);
      alert("팀 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const genderOptions = [
    { value: "MIXED", label: "혼성" },
    { value: "MALE", label: "남성" },
    { value: "FEMALE", label: "여성" },
  ];

  const frequencyOptions = [
    { value: "WEEKLY", label: "주 1회" },
    { value: "BIWEEKLY", label: "격주" },
    { value: "MONTHLY", label: "월 1회" },
    { value: "IRREGULAR", label: "불규칙" },
  ];

  const koreanCities = [
    "서울특별시",
    "부산광역시",
    "대구광역시",
    "인천광역시",
    "광주광역시",
    "대전광역시",
    "울산광역시",
    "세종특별자치시",
    "경기도",
    "강원도",
    "충청북도",
    "충청남도",
    "전라북도",
    "전라남도",
    "경상북도",
    "경상남도",
    "제주특별자치도",
  ];

  const isFormValid = formData.name && formData.city && formData.district;

  return (
    <div className="max-w-2xl mx-auto lg:max-w-4xl xl:max-w-2xl pb-16 flex flex-col">
      <div className="flex items-center justify-between h-16 shrink-0 px-3">
        <h1 className="text-2xl font-bold">팀 만들기</h1>
      </div>

      <div className="px-3 space-y-6">
        {/* 팀 이미지 섹션 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">팀 이미지</h2>

          {/* 커버 이미지 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              커버 이미지
            </h3>
            <div className="relative w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-500 mt-1">커버 이미지 업로드</p>
              </div>
            </div>
          </div>

          {/* 로고 이미지 */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              로고 이미지
            </h3>
            <div className="relative w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              <Camera className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 팀 정보 섹션 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">팀 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                팀 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="팀 이름을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                팀 소개
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                placeholder="팀에 대한 간단한 소개를 작성해주세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                팀 성별
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                활동 빈도
              </label>
              <select
                value={formData.activityFrequency}
                onChange={(e) =>
                  handleInputChange("activityFrequency", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 활동 지역 섹션 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            활동 지역
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                시/도 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">선택하세요</option>
                {koreanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                구/군 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="구/군을 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="pt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "팀 생성 중..." : "팀 만들기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamsCreatePage;
