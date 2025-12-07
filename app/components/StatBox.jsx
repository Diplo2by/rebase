import React from "react";

const StatBox = ({ icon: Icon, label, value, color = "text-white" }) => {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col items-start hover:border-[#58a6ff] transition-colors duration-300 group">
      <div
        className={`p-3 rounded-lg bg-[#0d1117] border border-[#30363d] mb-4 group-hover:scale-110 transition-transform ${color}`}
      >
        <Icon />
      </div>
      <span className="text-3xl font-bold tracking-tight text-white">
        {value}
      </span>
      <span className="text-sm font-medium text-[#8b949e] uppercase tracking-wider mt-1">
        {label}
      </span>
    </div>
  );
};

export default StatBox;
