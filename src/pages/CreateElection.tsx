import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  bio: string;
  party: string;
};

type Election = {
  electionName: string;
  startTime: string;
  endTime: string;
  electionDescription: string;
  eligibleGovernorates: string[];
  electionStatus: string;
};

const CreateElection = () => {
  const [formData, setFormData] = useState<Election>({
    electionName: "",
    startTime: "",
    endTime: "",
    electionDescription: "",
    eligibleGovernorates: [],
    electionStatus: "pending",
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showGovModal, setShowGovModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleGovernorate = (gov: string) => {
    setFormData((prev) => ({
      ...prev,
      eligibleGovernorates: prev.eligibleGovernorates.includes(gov)
        ? prev.eligibleGovernorates.filter((g) => g !== gov)
        : [...prev.eligibleGovernorates, gov],
    }));
  };

  const selectAllGovs = () => {
    setFormData((prev) => ({
      ...prev,
      eligibleGovernorates:
        prev.eligibleGovernorates.length === GOVERNORATES.length
          ? []
          : [...GOVERNORATES],
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCandidateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updated = [...candidates];
    updated[index] = { ...updated[index], [name]: value };
    setCandidates(updated);
  };

  const addCandidate = () => {
    setCandidates([...candidates, { name: "", bio: "", party: "" }]);
  };

  const deleteCandidate = (index: number) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.electionName ||
      !formData.startTime ||
      !formData.endTime ||
      candidates.length < 2
    ) {
      setError("يرجى تعبئة كل الحقول وإضافة مرشحين على الأقل");
      return;
    }
    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    const newElection = { ...formData, candidates };

    try {
      const res = await fetch("http://localhost:4000/elections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newElection),
      });
      if (res.ok) navigate("/election/manage");
      else setError("فشل في إنشاء الانتخابات");
    } catch {
      setError("حدث خطأ أثناء إرسال البيانات");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-center text-2xl font-bold mb-4">إنشاء انتخابات</h2>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          id="electionName"
          value={formData.electionName}
          onChange={handleInputChange}
          className="w-full border px-4 py-2 rounded-lg"
          placeholder="اسم الانتخابات"
        />
        <textarea
          id="electionDescription"
          value={formData.electionDescription}
          onChange={handleInputChange}
          className="w-full border px-4 py-2 rounded-lg"
          placeholder="وصف الانتخابات"
        />
        <input
          id="startTime"
          type="datetime-local"
          value={formData.startTime}
          onChange={handleInputChange}
          className="w-full border px-4 py-2 rounded-lg"
        />
        <input
          id="endTime"
          type="datetime-local"
          value={formData.endTime}
          onChange={handleInputChange}
          className="w-full border px-4 py-2 rounded-lg"
        />

        <div>
          <label className="block mb-2">المحافظات المؤهلة:</label>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
            onClick={() => setShowGovModal(true)}
          >
            اختيار المحافظات
          </button>
          <div className="text-gray-800">
            {formData.eligibleGovernorates.join("، ")}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">المرشحون</h3>
          {candidates.map((c, i) => (
            <div key={i} className="border p-4 mb-3 rounded-lg">
              <input
                placeholder="الاسم"
                name="name"
                value={c.name}
                onChange={(e) => handleCandidateChange(e, i)}
                className="w-full mb-2 px-2 py-1 border rounded"
              />
              <textarea
                placeholder="السيرة الذاتية"
                name="bio"
                value={c.bio}
                onChange={(e) => handleCandidateChange(e, i)}
                className="w-full mb-2 px-2 py-1 border rounded"
              />
              <input
                placeholder="الحزب"
                name="party"
                value={c.party}
                onChange={(e) => handleCandidateChange(e, i)}
                className="w-full mb-2 px-2 py-1 border rounded"
              />
              <button
                type="button"
                className="text-red-600"
                onClick={() => deleteCandidate(i)}
              >
                حذف
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addCandidate}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            إضافة مرشح
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4"
        >
          حفظ الانتخابات
        </button>
      </form>

      {/* Modal: Governorates */}
      {showGovModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">اختر المحافظات</h3>
            <button
              className="mb-3 bg-yellow-400 px-3 py-1 rounded text-sm"
              onClick={selectAllGovs}
            >
              {formData.eligibleGovernorates.length === GOVERNORATES.length
                ? "إلغاء تحديد الكل"
                : "تحديد الكل"}
            </button>
            <div className="space-y-2">
              {GOVERNORATES.map((gov) => (
                <label key={gov} className="block">
                  <input
                    type="checkbox"
                    checked={formData.eligibleGovernorates.includes(gov)}
                    onChange={() => toggleGovernorate(gov)}
                    className="mr-2"
                  />
                  {gov}
                </label>
              ))}
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowGovModal(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-xl">
            <h2 className="text-xl font-bold mb-4">تأكيد البيانات</h2>
            <p>
              <strong>الاسم:</strong> {formData.electionName}
            </p>
            <p>
              <strong>الوصف:</strong> {formData.electionDescription}
            </p>
            <p>
              <strong>المدة:</strong> {formData.startTime} → {formData.endTime}
            </p>
            <p>
              <strong>المحافظات:</strong>{" "}
              {formData.eligibleGovernorates.join(", ")}
            </p>
            <p>
              <strong>عدد المرشحين:</strong> {candidates.length}
            </p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={confirmSubmit}
                className="bg-green-600 text-white px-6 py-2 rounded"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateElection;
