import React from "react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-lg shadow-xl">
        <p className="text-sm font-medium text-white mb-1">
          {label || payload[0].name}
        </p>
        <p className="text-sm text-[#58a6ff]">
          {payload[0].value} {label ? "activities" : "%"}
        </p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
