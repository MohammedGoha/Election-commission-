import { useState } from "react";
import API_BASE from "../assets/glob";
import { handleApiError } from "../utils/handleApiError";
import { useAuth } from "../context/AuthContext";

export default function VoterActivityLog() {
  const [voterId, setVoterId] = useState("");
  const [activity, setActivity] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const fetchActivity = async () => {
    setLoading(true);
    setError("");
    setActivity([]);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/audits/voter-activity/${voterId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      handleApiError(res, logout);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "فشل في جلب بيانات النشاط");
        return;
      }
      setActivity(data.activity || []);
    } catch (err) {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">سجل نشاطات الناخب</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={voterId}
          onChange={(e) => setVoterId(e.target.value)}
          placeholder="أدخل معرف الناخب"
          className="flex-1 px-4 py-2 border rounded-md shadow-sm"
        />
        <button
          onClick={fetchActivity}
          disabled={!voterId || loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "جاري التحميل..." : "عرض السجل"}
        </button>
      </div>

      {error && <div className="text-red-600 text-center">{error}</div>}

      {activity.length > 0 && (
        <div className="mt-6 space-y-4">
          {activity.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <p className="text-sm text-gray-500 mb-2">
                {new Date(item.timestamp).toLocaleString("ar-EG")}
              </p>
              <h4 className="font-semibold text-lg text-gray-800 mb-1">
                {item.action === "user_registered"
                  ? "تسجيل مستخدم"
                  : item.action === "voted"
                  ? "صوت في الانتخابات"
                  : item.action === "user_status_updated"
                  ? "تحديث حالة المستخدم"
                  : item.action}
              </h4>
              <div className="text-gray-700 text-sm">
                {item.action === "user_registered" && (
                  <>
                    <p>المحافظة: {item.details.governorate}</p>
                    <p>الدور: {item.details.role}</p>
                  </>
                )}
                {item.action === "voted" && (
                  <>
                    <p>معرف الانتخابات: {item.details.election_id}</p>
                    <p>معرف المرشح: {item.details.candidate_id}</p>
                    <p>إيصال التصويت: {item.details.receipt}</p>
                  </>
                )}
                {item.action === "user_status_updated" && (
                  <>
                    <p>الحالة الجديدة: {item.details.status}</p>
                    <p>السبب: {item.details.reason}</p>
                    <p>تم التحديث بواسطة: {item.details.updated_by}</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activity.length === 0 && !loading && !error && (
        <div className="text-center text-gray-500 mt-6">
          لا توجد بيانات لعرضها حالياً.
        </div>
      )}
    </div>
  );
}
