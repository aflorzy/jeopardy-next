import React from "react";

const ProgressBar = ({
  progressPercentage,
}: {
  progressPercentage: number;
}) => {
  return (
    <div className="h-2 w-full bg-gray-300 absolute top-0 overflow-hidden">
      <div
        style={{ width: `${progressPercentage}%` }}
        className="h-full bg-green-600">
          <div className="progress"></div>
        </div>
    </div>
  );
};

export default ProgressBar;
