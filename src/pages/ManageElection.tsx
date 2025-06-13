import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../assets/glob";
import { useAuth } from "../context/AuthContext";
import { handleApiError } from "../utils/handleApiError";
type Candidate =
  | string
  | {
      name: string;
      bio: string;
      party: string;
      age: number;
      candidateName?: string;
    };

type Election = {
  election_id: string;
  name: string;
  election_image: string;
  candidates: Candidate[];
  voteTally: { [key: string]: number };
  start_time: string;
  end_time: string;
  description: string;
  eligible_governorates: string[] | string;
  status: "scheduled" | "live" | "ended" | "published" | "canceled";
};

const ManageElection = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [disabling, setDisabling] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthorized, logout } = useAuth();

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }

      const res = await fetch(`${API_BASE}/elections`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // if (res.status === 401) {
      //   logout();
      //   return;
      // }
      handleApiError(res, logout);
      if (!res.ok) {
        throw new Error("Failed to fetch elections");
      }

      const data = await res.json();
      setElections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }
    fetchElections();
  }, [isAuthorized]);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString("ar-EG");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "live":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-yellow-100 text-yellow-800";
      case "published":
        return "bg-purple-100 text-purple-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusArabic = (status: string) => {
    switch (status) {
      case "scheduled":
        return "مجدولة";
      case "live":
        return "جارية";
      case "ended":
        return "في انتظار النشر";
      case "published":
        return "منتهية";
      case "canceled":
        return "تم إيقاف";
      default:
        return "";
    }
  };

  const handleDisable = async (id: string) => {
    try {
      setDisabling(id);
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_BASE}/elections/${id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to disable election");
      }

      await fetchElections(); // Refresh the elections list
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disable election"
      );
    } finally {
      setDisabling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">إدارة الانتخابات</h1>

      {elections.map((election) => (
        <div
          key={election.election_id}
          className={`p-6 rounded-xl shadow-lg border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors`}
          onClick={() => navigate(`/currentElection/${election.election_id}`)}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold">{election.name}</h2>
              <p className="text-gray-600 mt-1">{election.description}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                election.status
              )}`}
            >
              {getStatusArabic(election.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">من:</span>{" "}
                {formatDate(election.start_time)}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">إلى:</span>{" "}
                {formatDate(election.end_time)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <span className="font-semibold">المحافظات:</span>{" "}
                {Array.isArray(election.eligible_governorates)
                  ? election.eligible_governorates.join("، ")
                  : election.eligible_governorates}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="font-semibold mb-2">المرشحون:</p>
            <ul className="list-disc pr-5 space-y-1">
              {election.candidates.map((candidate, index) => (
                <li key={index}>
                  {typeof candidate === "string"
                    ? candidate
                    : `${candidate.name} (${candidate.party})`}
                </li>
              ))}
            </ul>
          </div>

          {election.status === "scheduled" && (
            <div className="mt-4 flex justify-end">
              <button
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-800 transition-colors ${
                  disabling === election.election_id
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={disabling === election.election_id}
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmId(election.election_id);
                }}
              >
                {disabling === election.election_id
                  ? "جاري التعطيل..."
                  : "تعطيل الانتخابات"}
              </button>
            </div>
          )}
        </div>
      ))}

      {elections.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          لا توجد انتخابات متاحة حالياً.
        </p>
      )}

      {confirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center space-y-4">
            <h2 className="text-xl font-bold">هل أنت متأكد؟</h2>
            <p>سيتم تعطيل هذه الانتخابات ولن يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 bg-gray-400 rounded text-white hover:bg-gray-500 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={async () => {
                  await handleDisable(confirmId);
                  setConfirmId(null);
                }}
                className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 transition-colors"
              >
                تأكيد التعطيل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageElection;
