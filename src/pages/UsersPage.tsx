import { useState, useEffect } from "react";
import API_BASE from "../assets/glob";
import { handleApiError } from "../utils/handleApiError";
import { useAuth } from "../context/AuthContext";
const token = localStorage.getItem("access_token");

const UsersManagement = () => {
  const [tab, setTab] = useState<
    "list" | "certificate" | "revoke" | "revocations"
  >("revoke");

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        إدارة المستخدمين
      </h1>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-2 mb-8 border-b border-gray-200 pb-2">
        <button
          onClick={() => setTab("list")}
          className={`px-4 py-2 rounded-t-lg transition-all ${
            tab === "list"
              ? "bg-blue-600 text-white font-medium shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          عرض المستخدمين
        </button>
        <button
          onClick={() => setTab("revoke")}
          className={`px-4 py-2 rounded-t-lg transition-all ${
            tab === "revoke"
              ? "bg-blue-600 text-white font-medium shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          إلغاء مستخدم
        </button>
        <button
          onClick={() => setTab("revocations")}
          className={`px-4 py-2 rounded-t-lg transition-all ${
            tab === "revocations"
              ? "bg-blue-600 text-white font-medium shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          سجل الإلغاءات
        </button>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        {tab === "list" && <UserList />}
        {tab === "revoke" && <RevokeUser />}
        {tab === "revocations" && <RevocationHistory />}
      </div>
    </div>
  );
};

export default UsersManagement;

// ----------------------- User List -----------------------

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [governorate, setGovernorate] = useState("");
  const { logout } = useAuth();

  const GOVERNORATES = [
    "القاهرة",
    "الجيزة",
    "الإسكندرية",
    "الدقهلية",
    "البحر الأحمر",
    "البحيرة",
    "الفيوم",
    "الغربية",
    "الإسماعيلية",
    "المنوفية",
    "المنيا",
    "القليوبية",
    "الوادي الجديد",
    "السويس",
    "أسوان",
    "أسيوط",
    "بني سويف",
    "بورسعيد",
    "دمياط",
    "الشرقية",
    "جنوب سيناء",
    "كفر الشيخ",
    "مطروح",
    "الأقصر",
    "قنا",
    "شمال سيناء",
    "سوهاج",
  ];

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    if (role) {
      params.append("role", role);
    }
    if (status) {
      params.append("status", status);
    }
    if (governorate) {
      params.append("governorate", governorate);
    }

    const res = await fetch(`${API_BASE}/users?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    handleApiError(res, logout);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, [role, status, governorate]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">
        قائمة المستخدمين
      </h2>

      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm">
        <select
          value={governorate}
          onChange={(e) => setGovernorate(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        >
          <option value="">جميع المحافظات</option>
          {GOVERNORATES.map((gov) => (
            <option key={gov} value={gov}>
              {gov}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        >
          <option value="">جميع الحالات</option>
          <option value="active">مفعل</option>
          <option value="suspended">موقوف</option>
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        >
          <option value="">جميع الأدوار</option>
          <option value="voter">ناخب</option>
          <option value="election_commission">اللجنة الانتخابية</option>
          <option value="auditor">مدقق</option>
        </select>

        <button
          onClick={fetchUsers}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
        >
          بحث
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u: any) => (
          <div
            key={u.user_id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-700">🆔 {u.user_id}</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  u.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {u.status === "active" ? "مفعل" : "موقوف"}
              </span>
            </div>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {u.governorate}
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {u.role === "voter"
                  ? "ناخب"
                  : u.role === "election_commission"
                  ? "لجنة انتخابية"
                  : "مدقق"}
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(u.registration_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ----------------------- Revoke User -----------------------

const RevokeUser = () => {
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();

  const revoke = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      handleApiError(res, logout);
      const data = await res.json();
      setMsg(data.message || "تم الإلغاء بنجاح");
      setUserId("");
      setReason("");
    } catch (error) {
      setMsg("حدث خطأ أثناء الإلغاء");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">
        إلغاء مستخدم
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">معرف المستخدم</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="أدخل ID المستخدم"
            className="border border-gray-300 w-full px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">سبب الإلغاء</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="أدخل سبب الإلغاء"
            rows={3}
            className="border border-gray-300 w-full px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <button
          onClick={revoke}
          disabled={!userId || !reason || isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
          } transition-colors`}
        >
          {isLoading ? "جاري الإلغاء..." : "إلغاء المستخدم"}
        </button>

        {msg && (
          <div
            className={`p-3 rounded-md ${
              msg.includes("خطأ")
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  );
};

// ----------------------- Revocation History -----------------------

const RevocationHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/revocations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      handleApiError(res, logout);
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching revocation history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">
        سجل الإلغاءات
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المستخدم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السبب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    بواسطة
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((r: any) => (
                  <tr
                    key={r.timestamp}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {r.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {r.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {r.revoked_by}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && history.length === 0 && (
        <div className="bg-gray-50 p-8 text-center rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-700">
            لا توجد سجلات إلغاء
          </h3>
          <p className="mt-1 text-gray-500">
            لم يتم إلغاء أي مستخدمين حتى الآن
          </p>
        </div>
      )}
    </div>
  );
};
