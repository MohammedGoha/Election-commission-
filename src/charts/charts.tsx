import React from "react";

type GovernorateStat = {
  name: string;
  participants: number;
  eligible: number;
};

type Props = {
  totalEligible: number;
  totalVoted: number;
  duplicates: number;
  governorateStats: GovernorateStat[];
};

const ParticipationStats: React.FC<Props> = ({
  totalEligible,
  totalVoted,
  duplicates,
  governorateStats,
}) => {
  const percentage = ((totalVoted / totalEligible) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">نسبة المشاركة في الانتخابات</h2>

      <div className="mb-4">
        <p className="text-gray-700 mb-1">نسبة المشاركة العامة</p>
        <div className="w-full bg-gray-200 rounded h-4">
          <div
            className="bg-green-500 h-4 rounded"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">{percentage}%</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-gray-50 p-3 rounded border">
          <p className="text-gray-700 font-semibold">عدد الناخبين الكلي</p>
          <p className="text-blue-700 text-lg">{totalEligible}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded border">
          <p className="text-gray-700 font-semibold">عدد المصوتين</p>
          <p className="text-green-700 text-lg">{totalVoted}</p>
        </div>
      </div>

      <div className="bg-red-50 mt-4 p-3 rounded border border-red-200">
        <p className="text-red-600 font-semibold">محاولات التصويت المكرر</p>
        <p className="text-red-800 text-lg">{duplicates}</p>
      </div>

      <div className="mt-6">
        <h3 className="text-md font-bold mb-2">حسب المحافظة:</h3>
        {governorateStats.map((gov, idx) => {
          const rate = ((gov.participants / gov.eligible) * 100).toFixed(1);
          return (
            <div key={idx} className="mb-3">
              <p className="text-gray-700">{gov.name}</p>
              <div className="w-full bg-gray-100 rounded h-3">
                <div
                  className="bg-blue-500 h-3 rounded"
                  style={{ width: `${rate}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">{rate}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipationStats;
