import { useEffect, useState } from "react";
import API_BASE from "../assets/glob";
import {
  handleApiError,
  translateDetailKeyToArabic,
} from "../utils/handleApiError";
import { useAuth } from "../context/AuthContext";
type EventType =
  | "vote_cast"
  | "election_created"
  | "tally_computed"
  | "election_updated"
  | "user_registered"
  | "user_status_updated"
  | "election_status_changed"
  | "";

type ChaincodeEvent = {
  event_id: string;
  timestamp: string;
  event_type: EventType;
  details: Record<string, any>;
};
// function translateAuditEventTypeToArabic(eventType: EventType | ""): string {
//   const translations: Record<string, string> = {
//     vote_cast: "تصويت",
//     election_created: "إنشاء انتخابات",
//     election_updated: "تحديث بيانات الانتخابات",
//     tally_computed: "حساب نتائج التصويت",
//     user_registered: "تسجيل مستخدم جديد",
//     user_status_updated: "تحديث حالة المستخدم",
//     election_status_changed: "تغيير حالة الانتخابات",
//     "": "الكل", // For empty selection (i.e., "All")
//   };

//   return translations[eventType] || "حدث غير معروف";
// }

const EVENT_OPTIONS: { label: string; value: EventType | "" }[] = [
  { label: "الكل", value: "" },
  { label: "تصويت", value: "vote_cast" },
  { label: "إنشاء انتخابات", value: "election_created" },
  { label: "تحديث بيانات الانتخابات", value: "election_updated" },
  { label: "حساب نتائج التصويت", value: "tally_computed" },
  { label: "تسجيل مستخدم جديد", value: "user_registered" },
  { label: "تحديث حالة المستخدم", value: "user_status_updated" },
  { label: "تغيير حالة الانتخابات", value: "election_status_changed" },
];

const ChainCodeEvents = () => {
  const [events, setEvents] = useState<ChaincodeEvent[]>([]);
  const [eventType, setEventType] = useState<EventType>("");
  const [electionId, setElectionId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(50);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const fetchEvents = async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (eventType) params.append("eventType", eventType);
      if (electionId) params.append("electionId", electionId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("limit", limit.toString());

      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${API_BASE}/audits/chaincode-events?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      handleApiError(res, logout);
      if (!res.ok) throw new Error("فشل في جلب الأحداث");
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تحميل الأحداث");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const renderDetails = (details: Record<string, any>) => (
    <div className="mt-2 bg-gray-50 p-3 rounded-md">
      <h3 className="font-medium text-gray-700 mb-1">التفاصيل:</h3>
      <ul className="space-y-1 text-sm text-gray-600">
        {Object.entries(details).map(([key, value]) => (
          <li key={key} className="flex">
            <span className="font-medium text-gray-800 min-w-[120px]">
              {translateDetailKeyToArabic(key)}:
            </span>
            <span className="text-gray-600 break-all">
              {Array.isArray(value) ? value.join(", ") : String(value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );

  const getEventColor = (eventType: EventType): string => {
    switch (eventType) {
      case "vote_cast":
        return "bg-blue-100 text-blue-800";
      case "election_created":
        return "bg-green-100 text-green-800";
      case "election_updated":
        return "bg-yellow-100 text-yellow-800";
      case "tally_computed":
        return "bg-purple-100 text-purple-800";
      case "user_registered":
        return "bg-cyan-100 text-cyan-800";
      case "user_status_updated":
        return "bg-orange-100 text-orange-800";
      case "election_status_changed":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800"; // fallback
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          أحداث سلسلة الكتل
        </h1>

        {/* Filters Section */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {EVENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="معرّف الانتخابات"
              className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={electionId}
              onChange={(e) => setElectionId(e.target.value)}
            />

            <div className="relative">
              <input
                type="date"
                className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {startDate && (
                <button
                  onClick={() => setStartDate("")}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="date"
                className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {endDate && (
                <button
                  onClick={() => setEndDate("")}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            <input
              type="number"
              placeholder="عدد النتائج"
              min="1"
              className="border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={fetchEvents}
              disabled={isLoading}
              className={`px-6 py-2 rounded-md text-white font-medium ${
                isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              } transition-colors flex items-center`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  جاري التحميل...
                </>
              ) : (
                "بحث"
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Events List */}
        {isLoading && events.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : events.length === 0 ? (
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
              لا توجد أحداث مسجلة
            </h3>
            <p className="mt-1 text-gray-500">
              قم بتعديل عوامل التصفية أو حاول مرة أخرى لاحقًا
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.event_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getEventColor(
                          event.event_type
                        )}`}
                      >
                        {EVENT_OPTIONS.find((e) => e.value === event.event_type)
                          ?.label || event.event_type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">معرّف الحدث:</span>{" "}
                      {event.event_id}
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>
                </div>

                {renderDetails(event.details)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainCodeEvents;
