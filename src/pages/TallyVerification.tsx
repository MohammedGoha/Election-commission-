// src/pages/TallyVerification.tsx
import { useEffect, useState } from "react";
import API_BASE from "../assets/glob";
import { handleApiError } from "../utils/handleApiError";
import { useAuth } from "../context/AuthContext";
type Candidate = {
  candidate_id: string;
  name: string;
  party: string;
};
type Election = {
  election_id: string;
  name: string;
  description: string;
  status: string;
  candidates: { candidate_id: string; name: string; party: string }[];
};

type TallyResult = {
  tally?: {
    candidate_id: string;
    votes: number;
  }[];
  total_votes?: number;
  discrepancy?: string;
  details?: {
    discrepancies: Record<string, { calculated: number; stored: number }>;
  };
  timestamp?: string;
};
function getCandidateName(
  candidateId: string,
  candidates: Candidate[]
): Candidate | null {
  return candidates.find((cand) => cand.candidate_id === candidateId) || null;
}
export default function TallyVerification() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loadingElections, setLoadingElections] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Election | null>(null);
  const [tally, setTally] = useState<TallyResult | null>(null);
  const [loadingTally, setLoadingTally] = useState(false);

  const token = localStorage.getItem("access_token") || "";
  const { logout } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE}/elections`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        handleApiError(res, logout);
        return res.json();
      })
      .then((data: Election[]) => {
        const ready = data.filter((e) =>
          ["ended", "published"].includes(e.status)
        );
        setElections(ready);
      })
      .catch(() => setError("فشل تحميل قائمة الانتخابات"))
      .finally(() => setLoadingElections(false));
  }, []);

  const verifyTally = async (electionId: string) => {
    setLoadingTally(true);
    setTally(null);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/audits/tally/${electionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      handleApiError(res, logout);
      const data = await res.json();
      if (!res.ok) {
        setError(data.discrepancy || data.status || "فشل التحقق من الأصوات");
        setTally(null); // prevent rendering invalid structure
      } else {
        setTally(data);
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoadingTally(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        التحقق من تجميع الأصوات
      </h2>

      {/* Elections List */}
      <div className="mb-6">
        {loadingElections ? (
          <p className="text-center">جاري تحميل الانتخابات...</p>
        ) : elections.length === 0 ? (
          <p className="text-center text-gray-600">
            لا توجد انتخابات جاهزة للتحقق
          </p>
        ) : (
          <ul className="space-y-2">
            {elections.map((e) => (
              <li key={e.election_id}>
                <button
                  onClick={() => {
                    setSelected(e);
                    verifyTally(e.election_id);
                  }}
                  className={`w-full text-right p-4 rounded-lg border 
                    ${
                      selected?.election_id === e.election_id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  <h3 className="font-semibold">{e.name}</h3>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {e.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    عدد المرشحين: {e.candidates.length}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tally Result or Error */}
      {loadingTally && (
        <p className="text-center text-blue-600">جاري التحقق...</p>
      )}

      {error && (
        <p className="text-center text-red-600 font-semibold">{error}</p>
      )}

      {tally && !tally.discrepancy && (
        <div className="bg-green-50 border border-green-300 p-4 rounded-lg">
          <h4 className="font-bold text-green-800 mb-2">التحقق ناجح</h4>
          {typeof tally.total_votes === "number" && (
            <p>إجمالي الأصوات: {tally.total_votes}</p>
          )}
          {tally.timestamp && (
            <p className="text-sm text-gray-600 mb-2">
              تم التحديث: {new Date(tally.timestamp).toLocaleString()}
            </p>
          )}
          {tally.tally && (
            <ul className="space-y-1">
              {tally.tally.map((c) => (
                <li
                  key={c.candidate_id}
                  className="flex justify-between p-2 bg-white rounded shadow-sm"
                >
                  <span>
                    {getCandidateName(
                      c.candidate_id,
                      selected?.candidates || []
                    )?.name || "غير معروف"}
                  </span>
                  <span>{c.votes} صوت</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tally?.discrepancy && (
        <div className="bg-yellow-50 border border-yellow-400 p-4 rounded-lg">
          <h4 className="font-bold text-yellow-800 mb-2">
            ⚠️ اختلاف في النتائج
          </h4>
          <p className="mb-2">{tally.discrepancy}</p>
          {tally.timestamp && (
            <p className="text-sm text-gray-600 mb-2">
              تم التحديث: {new Date(tally.timestamp).toLocaleString()}
            </p>
          )}
          {tally.details?.discrepancies && (
            <ul className="space-y-2">
              {Object.entries(tally.details.discrepancies).map(
                ([cand, vals]) => (
                  <li
                    key={cand}
                    className="p-2 bg-white rounded shadow-sm border"
                  >
                    <strong>
                      {cand === "totals" ? "الإجمالي" : `مرشح: ${cand}`}
                    </strong>
                    <div className="text-sm">
                      <span className="mr-4">محسوب: {vals.calculated}</span>
                      <span>المخزن: {vals.stored}</span>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
