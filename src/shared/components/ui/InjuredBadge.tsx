import { FirstAidIcon } from "@phosphor-icons/react";

const InjuredBadge = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
  return (
    <div
      className={`absolute -bottom-0.5 -right-0.5 bg-white flex items-center justify-center shadow ${
        size === "sm" ? "size-4 rounded-md" : "size-5 rounded-lg"
      }`}
    >
      <FirstAidIcon
        className={`text-red-600 ${size === "sm" ? "size-3" : "size-3.5"}`}
        weight="fill"
      />
    </div>
  );
};

export default InjuredBadge;
