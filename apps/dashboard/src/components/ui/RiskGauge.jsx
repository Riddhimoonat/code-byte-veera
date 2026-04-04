import React from 'react';

const RiskGauge = ({ score = 0, size = 160 }) => {
  const radius = 70;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * (circumference / 2);

  const getColor = (s) => {
    if (s < 30) return "#2ECC71";
    if (s < 65) return "#F5A623";
    return "#E8453C";
  };

  return (
    <div className="relative flex items-center justify-center pt-4">
      <svg
        height={size / 2 + 20}
        width={size}
        className="transform rotate-[180deg]"
      >
        <circle
          stroke="#1A1A1A"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset: circumference / 2 }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
        />
        <circle
          stroke={getColor(score)}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ 
            strokeDashoffset,
            transition: 'stroke-dashoffset 1.5s ease-out'
          }}
          r={normalizedRadius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <span className="text-3xl font-bold tracking-tighter" style={{ color: getColor(score) }}>
          {Math.round(score)}
        </span>
        <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
          Risk Index
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
