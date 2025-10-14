import Image from "next/image";

interface AuthButtonProps {
  providerName: string;
  symbol: string;
  containerColor: string;
  lableColor: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function AuthButton({
  providerName,
  symbol,
  containerColor,
  lableColor,
  onClick,
  isLoading = false,
  disabled = false,
}: AuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-stretch rounded-sm transition-colors duration-200 group disabled:opacity-50 cursor-pointer disabled:cursor-default active:scale-98 hover:ring-2 ring-black active:ring-2"
      style={{
        backgroundColor: containerColor,
        transition: "scale 0.05s ease-in-out",
      }}
    >
      {/* 로고 영역 - 실제 로고 이미지가 들어갈 자리 */}
      <div
        className="size-12 sm:size-11 rounded flex items-center justify-center flex-shrink-0"
        aria-label={`${providerName} 로고`}
      >
        {/* 여기에 실제 로고 이미지가 들어갑니다 */}
        <Image
          src={symbol}
          alt=""
          className={
            providerName === "구글"
              ? "size-5.5"
              : providerName === "네이버"
              ? "size-4.5"
              : "size-5"
          }
          width={24}
          height={24}
        />
      </div>

      {/* 버튼 텍스트 */}
      <div
        className={`grow sm:text-sm border-l flex items-center justify-center pl-3 ${
          lableColor === "#000000/85"
            ? "font-medium border-black/5"
            : "font-bold border-white/20 "
        }`} //
        style={{ color: lableColor }}
      >
        {isLoading ? "로그인 중..." : `${providerName} 로그인`}
      </div>

      <div className="size-12 sm:size-11 flex items-center justify-center">
        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="size-5 border-2 border-black/15 border-t-gray-600 rounded-full animate-spin flex-shrink-0" />
        )}
      </div>
    </button>
  );
}
