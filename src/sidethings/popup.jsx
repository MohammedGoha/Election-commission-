// working accordion 
// const RevocationHistory = () => {

//   const [history, setHistory] = useState<any[]>([]);
//   const [expanded, setExpanded] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const { logout } = useAuth();
//   const token = localStorage.getItem("access_token");

//   const fetchHistory = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/users/revocations`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       handleApiError(res, logout);
//       const data = await res.json();
//       setHistory(data);
//     } catch (error) {
//       console.error("Error fetching revocation history:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const toggleExpanded = (id: string) => {
//     setExpanded((prev) => (prev === id ? null : id));
//   };

//   return (
//     <div className="space-y-6 p-4">
//       <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">
//         سجل الإلغاءات
//       </h2>

//       {isLoading ? (
//         <div className="flex justify-center items-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : history.length === 0 ? (
//         <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
//           <svg
//             className="mx-auto h-12 w-12 text-gray-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//             />
//           </svg>
//           <h3 className="mt-2 text-lg font-medium text-gray-700">
//             لا توجد سجلات إلغاء
//           </h3>
//           <p className="mt-1 text-gray-500">
//             لم يتم إلغاء أي مستخدمين حتى الآن
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {history.map((r) => (
//             <div
//               key={r.timestamp}
//               className="border border-gray-300 bg-white rounded-lg shadow-sm transition"
//             >
//               <button
//                 onClick={() => toggleExpanded(r.timestamp)}
//                 className="w-full text-right p-4 flex justify-between items-center focus:outline-none hover:bg-gray-50"
//               >
//                 <div>
//                   <div className="font-semibold text-gray-800">{r.user_id}</div>
//                   <div className="text-sm text-gray-500">
//                     بتاريخ: {new Date(r.timestamp).toLocaleString()}
//                   </div>
//                 </div>
//                 <div className="text-sm text-blue-600 font-medium">
//                   تم الإلغاء بواسطة: {r.revoked_by}
//                 </div>
//               </button>
//               {expanded === r.timestamp && (
//                 <div className="bg-gray-50 px-6 py-4 border-t text-sm text-gray-700">
//                   <strong>السبب:</strong>
//                   <p className="mt-2 leading-relaxed">{r.reason}</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// the thing that yousef does not like for no reason it's good he have trouble seeing 
const RevokeUser = () => {
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const token = localStorage.getItem("access_token");

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

// const RevocationHistory = () => {
//   const [history, setHistory] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const { logout } = useAuth();
//   const token = localStorage.getItem("access_token");

//   const fetchHistory = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/users/revocations`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       handleApiError(res, logout);
//       const data = await res.json();
//       setHistory(data);
//     } catch (error) {
//       console.error("Error fetching revocation history:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-semibold text-gray-700 border-b pb-2">
//         سجل الإلغاءات
//       </h2>

//       {isLoading ? (
//         <div className="flex justify-center items-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     المستخدم
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     السبب
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     التاريخ
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     بواسطة
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {history.map((r: any) => (
//                   <tr
//                     key={r.timestamp}
//                     className="hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {r.user_id}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {r.reason}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {new Date(r.timestamp).toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {r.revoked_by}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {!isLoading && history.length === 0 && (
//         <div className="bg-gray-50 p-8 text-center rounded-lg">
//           <svg
//             className="mx-auto h-12 w-12 text-gray-400"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//             />
//           </svg>
//           <h3 className="mt-2 text-lg font-medium text-gray-700">
//             لا توجد سجلات إلغاء
//           </h3>
//           <p className="mt-1 text-gray-500">
//             لم يتم إلغاء أي مستخدمين حتى الآن
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

