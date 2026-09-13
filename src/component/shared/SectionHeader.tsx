import React from "react";

interface SectionHeaderProps {
  title: string;
  titleColorClass?: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  titleColorClass = "text-[#406386]",
  subtitle,
  center = true,
  className = "",
}) => {
  return (
    <div className={`${center ? "text-center" : ""} mb-10 sm:mb-14 ${className}`}>
      <h2
        className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${titleColorClass} mb-3`}
      >
        {title}
      </h2>
      <div
        className={`h-1 w-16 rounded-full bg-gradient-to-r from-[#406386] to-cyan-400 ${center ? "mx-auto" : ""} mb-4`}
      />
      {subtitle && (
        <p className="max-w-2xl mx-auto text-sm text-gray-500 sm:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
