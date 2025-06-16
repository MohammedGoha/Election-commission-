import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import API_BASE from "../assets/glob";
import { handleApiError } from "../utils/handleApiError";
import { useAuth } from "../context/AuthContext";

type Candidate = {
  name: string;
  bio: string;
  party: string;
  profile_image: string;
};

type Election = {
  election_id: string;
  name: string;
  election_image: string;
  candidates: Candidate[];
  start_time: string;
  end_time: string;
  description: string;
  eligible_governorates: string[];
  status: string;
};

const COLORS = ["#1E88E5", "#43A047", "#FB8C00", "#E53935", "#6D4C41"];
const CurrentElection: React.FC = () => {
  const [election, setElection] = useState<Election | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [tally, setTally] = useState<any | null>(null);
  const token = localStorage.getItem("access_token");
  const { logout } = useAuth();

  useEffect(() => {
    let liveTallyInterval: any;

    const fetchElection = async () => {
      try {
        const res = await fetch(`${API_BASE}/elections/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        handleApiError(res, logout);
        const data: Election = await res.json();
        setElection(data);
      } catch (err) {
        setError("تعذر تحميل بيانات الانتخابات");
      }
    };

    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${API_BASE}/elections/${id}/analytics`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        handleApiError(res, logout);
        const data = await res.json();
        setAnalysis(data);
      } catch (err) {
        setError("تعذر تحميل تحليلات الانتخابات");
      }
    };

    const fetchTally = async () => {
      try {
        const res = await fetch(`${API_BASE}/elections/${id}/tally`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        handleApiError(res, logout);
        const data = await res.json();
        setTally(data);
      } catch (err) {
        console.error("تعذر تحميل بيانات التصويت اللحظي");
      }
    };

    // Initial fetches
    fetchElection();
    fetchAnalytics();
    fetchTally();

    // Live election polling
    if (election?.status === "live") {
      liveTallyInterval = setInterval(() => {
        fetchTally();
      }, 10000);
    }

    // Cleanup function
    return () => {
      if (liveTallyInterval) clearInterval(liveTallyInterval);
    };
  }, [id, election?.status]);

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleString("ar-EG");

  const pieData =
    analysis?.voter_demographics?.age_groups &&
    Object.entries(analysis.voter_demographics.age_groups).map(
      ([group, count]) => ({
        name: group,
        value: count,
      })
    );

  const feedbackData =
    analysis?.voter_feedback &&
    Object.entries(analysis.voter_feedback).map(([type, value]) => ({
      type,
      count: value,
    }));

  const locationData =
    analysis?.voter_locations &&
    Object.entries(analysis.voter_locations).map(([loc, count]) => ({
      location: loc,
      votes: count,
    }));

  const candidateVotesData = analysis?.candidate_votes?.map((c: any) => ({
    candidate_id: c.candidate_id,
    votes: c.votes,
    name: c.name,
  }));
  console.log("here", candidateVotesData);
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/election/manage")}
        className="mb-6 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-900"
      >
        رجوع
      </button>

      {error && (
        <p className="text-red-500 text-center font-semibold">{error}</p>
      )}

      {election && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{election.name}</h1>
            <p className="text-gray-700 mb-4">{election.description}</p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>
                <strong>تاريخ البدء:</strong> {formatDate(election.start_time)}
              </p>
              <p>
                <strong>تاريخ الانتهاء:</strong> {formatDate(election.end_time)}
              </p>
              <p>
                <strong>المحافظات المؤهلة:</strong>{" "}
                {election.eligible_governorates.join(", ")}
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">المرشحون</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {election.candidates.map((candidate, index) => (
                <div key={index} className="flex flex-col items-center">
                  <img
                    src={`${API_BASE}/${candidate.profile_image}`}
                    alt={candidate.name}
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 shadow-md"
                  />
                  <p className="mt-2 font-semibold">{candidate.name}</p>
                </div>
              ))}
            </div>
          </div>
          {tally && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-center mb-4">
                نتائج التصويت اللحظي
              </h2>
              <p className="text-center text-gray-600 mb-4">
                إجمالي الأصوات:{" "}
                <span className="font-semibold">{tally.total_votes}</span>
              </p>
              <div className="flex flex-wrap justify-center gap-8">
                {tally.candidates.map((candidate: any, index: number) => (
                  <div key={index} className="text-center">
                    <p className="font-semibold">{candidate.name}</p>
                    <p className="text-sm text-gray-500">{candidate.party}</p>
                    <p className="text-blue-600 font-bold text-lg mt-1">
                      {candidate.votes} صوت
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">
                آخر تحديث:{" "}
                {new Date(tally.last_updated).toLocaleString("ar-EG")}
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-10 mt-10">
              <div className="text-center mb-4">
                <button
                  onClick={() => {
                    setError(null);
                    setAnalysis(null);
                    console.log("here");
                    // re-fetch analysis
                    fetch(
                      `${API_BASE}/elections/${id}/analytics?forceRefresh=true`,
                      {
                        method: "GET",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    )
                      .then((res) => {
                        handleApiError(res, logout);
                        return res.json();
                      })
                      .then((data) => {
                        console.log("here");
                        setAnalysis(data);
                      })
                      .catch(() => setError("تعذر تحميل تحليلات الانتخابات"));
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  إعادة تحميل التحليل
                </button>
              </div>

              <h2 className="text-2xl font-bold text-center mb-6">
                تحليلات التصويت
              </h2>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  عدد الأصوات للمرشحين
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={candidateVotesData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="votes" fill="#2196F3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  الفئات العمرية للناخبين
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      label
                    >
                      {pieData?.map((_: any, index: any) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">آراء الناخبين</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={feedbackData}>
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">
                  توزيع التصويت حسب الموقع
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={locationData}>
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="votes" fill="#FF9800" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrentElection;
