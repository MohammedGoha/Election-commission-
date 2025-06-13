import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../assets/glob";
import { handleApiError } from "../utils/handleApiError";
import { useAuth } from "../context/AuthContext";

type Election = {
  election_id: string;
  name: string;
  description: string;
  status: string;
  start_time: string;
  end_time: string;
  election_image: string;
  eligible_governorates: string[];
};

type Tally = {
  election_id: string;
  election_name: string;
  total_votes: number;
  candidates: {
    candidate_id: string;
    name: string;
    party: string;
    votes: number;
  }[];
  last_updated: string;
};

type ToastProps = {
  message: string;
  type: "success" | "error";
};

function Toast({ message, type }: ToastProps) {
  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50 text-white text-sm transition-all duration-300 ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {message}
    </div>
  );
}

export default function PublishElection() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tallies, setTallies] = useState<Record<string, Tally>>({});
  const [publishing, setPublishing] = useState<string | null>(null);
  const { logout } = useAuth();
  const token = localStorage.getItem("access_token") || "";
  const navigate = useNavigate();

  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch(`${API_BASE}/elections`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        handleApiError(res, logout);
        return res.json();
      })
      .then((data: Election[]) => {
        const ended = data.filter((e) => e.status === "ended");
        setElections(ended);
        ended.forEach((e) => fetchTally(e.election_id));
      })
      .catch(() => setError("فشل تحميل الانتخابات"))
      .finally(() => setLoading(false));
  }, []);

  const fetchTally = (electionId: string) => {
    fetch(`${API_BASE}/elections/${electionId}/tally`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("خطأ في السيرفر");
        }
        handleApiError(res, logout);
        return res.json();
      })
      .then((data) => setTallies((prev) => ({ ...prev, [electionId]: data })));
  };

  const publishElection = async (id: string) => {
    setPublishing(id);
    try {
      const res = await fetch(`${API_BASE}/elections/${id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      handleApiError(res, logout);
      if (!res.ok) throw new Error("خطأ في السيرفر");

      setElections((prev) => prev.filter((e) => e.election_id !== id));
      showToast("تم نشر الانتخابات بنجاح", "success");
    } catch {
      showToast("فشل في النشر", "error");
    } finally {
      setPublishing(null);
    }
  };

  if (loading) return <p className="text-center py-10">جاري التحميل...</p>;
  if (error) return <p className="text-red-600 text-center py-10">{error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <h1 className="text-3xl font-bold text-center mb-6">
        نشر الانتخابات المنتهية
      </h1>

      {elections.length === 0 ? (
        <p className="text-center text-gray-600">
          لا توجد انتخابات جاهزة للنشر
        </p>
      ) : (
        <div className="space-y-6">
          {elections.map((e) => (
            <div
              key={e.election_id}
              className="bg-white shadow rounded-xl p-6 flex gap-6 items-start"
            >
              <img
                src={`${API_BASE}/${e.election_image}`}
                alt={e.name}
                className="w-40 h-32 object-cover rounded-lg border"
              />
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-bold">{e.name}</h2>
                <p className="text-gray-700">{e.description}</p>
                <p className="text-sm text-gray-500">
                  من {new Date(e.start_time).toLocaleString()} إلى{" "}
                  {new Date(e.end_time).toLocaleString()}
                </p>

                {tallies[e.election_id] ? (
                  <div className="mt-3 border-t pt-3 space-y-2">
                    <h3 className="font-semibold text-lg">النتائج:</h3>
                    <ul className="list-disc ml-5 text-sm">
                      {tallies[e.election_id].candidates.map((c) => (
                        <li key={c.candidate_id}>
                          {c.name} ({c.party}) — {c.votes} صوت
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-600">
                      المجموع: {tallies[e.election_id].total_votes} صوت
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">جاري تحميل النتائج...</p>
                )}

                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => publishElection(e.election_id)}
                    disabled={publishing === e.election_id}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    {publishing === e.election_id ? "جاري النشر..." : "نشر"}
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/currentElection/${e.election_id}`)
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    عرض التحليلات
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
