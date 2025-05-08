import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type GovernorateStat = {
  name: string;
  participants: number;
  eligible: number;
};

type ParticipationData = {
  totalEligible: number;
  totalVoted: number;
  duplicates: number;
  governorateStats: GovernorateStat[];
};

const VoterParticipationPage: React.FC = () => {
  const [data, setData] = useState<ParticipationData | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:4000/voters/participation");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch participation data", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every 60 sec
    return () => clearInterval(interval);
  }, []);

  if (!data) return <p>جاري تحميل بيانات المشاركة...</p>;

  const participationRate = Math.round(
    (data.totalVoted / data.totalEligible) * 100
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-right mb-6">
        إحصائيات مشاركة الناخبين
      </h1>

      <div className="mb-6 text-right space-y-2">
        <p>
          إجمالي الناخبين المؤهلين: <strong>{data.totalEligible}</strong>
        </p>
        <p>
          إجمالي المصوتين: <strong>{data.totalVoted}</strong>
        </p>
        <p>
          نسبة المشاركة: <strong>{participationRate}%</strong>
        </p>
        <p>
          محاولات مكررة مرفوضة: <strong>{data.duplicates}</strong>
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-right">
        مشاركة حسب المحافظات
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data.governorateStats}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 50, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ dx: -70, textAnchor: "end", fontSize: 14 }}
            style={{
              textAlign: "right",
            }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="eligible" fill="#E2AB58" name="الناخبين المؤهلين" />
          <Bar dataKey="participants" fill="#1565C0" name="المشاركون" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VoterParticipationPage;
