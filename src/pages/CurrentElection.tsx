import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Candidate = {
  name: string;
  bio: string;
  party: string;
  age: number;
};

type Election = {
  electionId: string;
  electionName: string;
  electionDescription: string;
  candidates: Candidate[];
  voteTally: { [key: string]: number };
  startTime: string;
  endTime: string;
  eligibleGovernorates: string[];
  electionStatus: string;
};

const CurrentElection: React.FC = () => {
  const [election, setElection] = useState<Election | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElection = async () => {
      const res = await fetch("http://localhost:4000/elections");
      const data: Election[] = await res.json();
      const current = data.find((e) => e.electionStatus === "active");
      if (current) setElection(current);
    };
    fetchElection();
  }, []);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString("ar-EG");
  };

  const voteChartData = election?.candidates.map((cand) => ({
    name: cand.name,
    votes: election.voteTally[cand.name] || 0,
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate("/election/manage")}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-900"
      >
        رجوع
      </button>

      {!election ? (
        <p className="text-center text-gray-500">
          جاري تحميل بيانات الانتخابات...
        </p>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center mb-4">
            {election.electionName}
          </h1>
          <p className="text-gray-700 text-center mb-2">
            {election.electionDescription}
          </p>

          <div className="text-right space-y-2 mb-4">
            <p>
              <strong>تاريخ البدء:</strong> {formatDate(election.startTime)}
            </p>
            <p>
              <strong>تاريخ الانتهاء:</strong> {formatDate(election.endTime)}
            </p>
            <p>
              <strong>المحافظات:</strong>{" "}
              {election.eligibleGovernorates.join(" - ")}
            </p>
          </div>

          <h2 className="text-xl font-semibold text-right mb-2">
            نتائج التصويت:
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={voteChartData}
              margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tick={{ dx: -30, textAnchor: "end", fontSize: 14 }}
                style={{
                  textAlign: "right",
                }}
              />
              <Tooltip />
              <Bar dataKey="votes" fill="#1565C0" name="عدد الأصوات" />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default CurrentElection;
