import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../assets/glob";
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

type Candidate = {
  name: string;
  party: string;
  profileImage: File | null;
};

type FormCandidatePayload = {
  name: string;
  party: string;
  profile_image: string;
};

const CreateElection = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [electionImage, setElectionImage] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showGovModal, setShowGovModal] = useState(false);
  const navigate = useNavigate();
  const status = "compeleted";
  const token = localStorage.getItem("access_token");
  // const API = "http://192.168.1.3:3000/api/v1";

  const uploadFile = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_BASE}/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!res.ok) throw new Error("فشل في رفع الصورة");

    const data = await res.json();
    return data.url;
  };
  // const uploadFile = (file: File) => {
  //   return "none";
  // };

  // useEffect(() => {
  //   const fetchElections = async () => {
  //     const res = await fetch("http://192.168.1.3:3000/api/v1/elections", {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (!res.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     const data = await res.json();
  //     console.log(data.massage);
  //   };
  //   fetchElections();
  // });
  const handleCandidateChange = (
    index: number,
    key: keyof Candidate,
    value: string | File | null
  ) => {
    const updated = [...candidates];
    updated[index] = { ...updated[index], [key]: value };
    setCandidates(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (
      !name ||
      !startTime ||
      !endTime ||
      governorates.length === 0 ||
      candidates.length < 2 ||
      !electionImage
    ) {
      setError("يرجى تعبئة جميع الحقول وإضافة صورة انتخابات ومرشحين");
      setSubmitting(false);
      return;
    }

    try {
      const electionImageUrl = await uploadFile(electionImage);

      const candidatePayload: FormCandidatePayload[] = await Promise.all(
        candidates.map(async (c) => {
          if (!c.profileImage) throw new Error("يجب رفع صورة لكل مرشح");
          const url = await uploadFile(c.profileImage);
          return {
            name: c.name,
            party: c.party,
            profile_image: url,
          };
        })
      );

      const res = await fetch(`${API_BASE}/elections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          start_time: startTime,
          end_time: endTime,
          eligible_governorates: governorates,
          candidates: candidatePayload,
          election_image: electionImageUrl,
          status: status,
        }),
        
      });

      if (!res.ok) throw new Error("فشل في إنشاء الانتخابات");

      navigate("/election/manage");
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGov = (g: string) => {
    setGovernorates((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const selectAllGovernorates = () => {
    if (governorates.length === GOVERNORATES.length) {
      setGovernorates([]);
    } else {
      setGovernorates([...GOVERNORATES]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg my-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        إنشاء انتخابات
      </h2>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="text-center">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">اسم الانتخابات</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="اسم الانتخابات"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">وصف الانتخابات</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="وصف الانتخابات"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">وقت البدء</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">وقت الانتهاء</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">صورة الانتخابات</label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300">
                <span>اختر صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setElectionImage(e.target.files?.[0] || null)
                  }
                  required
                />
              </label>
              {electionImage && (
                <span className="text-green-600">{electionImage.name}</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              المحافظات المؤهلة
            </label>
            <button
              type="button"
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg mb-2"
              onClick={() => setShowGovModal(true)}
            >
              اختر المحافظات
            </button>
            {governorates.length > 0 ? (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-gray-800">{governorates.join("، ")}</p>
              </div>
            ) : (
              <p className="text-gray-500">لم يتم اختيار أي محافظات</p>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              المرشحون
            </h3>
            {candidates.length === 0 && (
              <p className="text-gray-500 mb-4">لا يوجد مرشحين مضافين</p>
            )}

            <div className="space-y-4">
              {candidates.map((c, i) => (
                <div
                  key={i}
                  className="border border-gray-200 p-4 rounded-lg bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 mb-1">الاسم</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="اسم المرشح"
                        value={c.name}
                        onChange={(e) =>
                          handleCandidateChange(i, "name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">الحزب</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="الحزب"
                        value={c.party}
                        onChange={(e) =>
                          handleCandidateChange(i, "party", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">
                      صورة المرشح
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg border border-gray-300 text-sm">
                        <span>اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleCandidateChange(
                              i,
                              "profileImage",
                              e.target.files?.[0] || null
                            )
                          }
                          required
                        />
                      </label>
                      {c.profileImage && (
                        <span className="text-sm text-green-600">
                          {c.profileImage.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 text-sm"
                    onClick={() =>
                      setCandidates(candidates.filter((_, j) => j !== i))
                    }
                  >
                    حذف المرشح
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                setCandidates([
                  ...candidates,
                  { name: "", party: "", profileImage: null },
                ])
              }
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              إضافة مرشح جديد
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition duration-200"
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              جاري الحفظ...
            </span>
          ) : (
            "حفظ الانتخابات"
          )}
        </button>
      </form>

      {showGovModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                اختر المحافظات
              </h3>
              <button
                onClick={() => setShowGovModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <button
                type="button"
                onClick={selectAllGovernorates}
                className={`px-3 py-1 rounded-lg text-sm ${
                  governorates.length === GOVERNORATES.length
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {governorates.length === GOVERNORATES.length
                  ? "إلغاء اختيار الكل"
                  : "اختيار الكل"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOVERNORATES.map((g) => (
                <label
                  key={g}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={governorates.includes(g)}
                    onChange={() => toggleGov(g)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-800">{g}</span>
                </label>
              ))}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowGovModal(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                تم الاختيار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateElection;
