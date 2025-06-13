import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      login();
      navigate("/");
    }
  }, []);

  // const API = "http://192.168.1.6:3000"; // Your local API

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/uploads`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || data.error || "خطا في رفع الصور");
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Upload images
      const [frontUrl, backUrl, selfieUrl] = await Promise.all([
        frontImage ? uploadFile(frontImage) : Promise.reject("الوجه غير موجود"),
        backImage ? uploadFile(backImage) : Promise.reject("الظهر غير موجود"),
        selfieImage
          ? uploadFile(selfieImage)
          : Promise.reject("السيلفي غير موجود"),
      ]);

      // Send registration request
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          national_id: nationalId,
          phone,
          governorate,
          invitation_code: invitationCode,
          photo_id_front: frontUrl,
          photo_id_back: backUrl,
          face_selfie: selfieUrl,
        }),
      });

      const result = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(result.message || result.error || "فشل التسجيل");
      }

      // Store credentials
      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("certificate", result.certificate);
      localStorage.setItem("private_key", result.private_key);

      login();
      navigate("/");
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/30 login-page">
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: "url('/path/to/your/background-image.jpg')",
            }}
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white/60 backdrop-blur-sm rounded-xl shadow-xl p-8 space-y-6"
        >
          {error && (
            <div className="text-red-600 text-center font-semibold">
              {error}
            </div>
          )}

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EGY Vote</h1>
            <p className="text-gray-600">سجل حساب جديد</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="national_id" className="block text-lg mb-2">
                الرقم القومي
              </label>
              <input
                type="text"
                id="national_id"
                required
                className="w-full px-4 py-2 border border-black-300 rounded-lg"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-lg mb-2">
                رقم الهاتف
              </label>
              <input
                type="text"
                id="phone"
                required
                className="w-full px-4 py-2 border border-black-300 rounded-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="governorate" className="block text-lg mb-2">
                المحافظة
              </label>
              <select
                id="governorate"
                required
                className="w-full px-4 py-2 border border-black-300 rounded-lg"
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
              >
                <option value="" disabled>
                  اختر المحافظة
                </option>
                {GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="invitationCode" className="block text-lg mb-2">
                كود الدعوة (اختياري)
              </label>
              <input
                type="text"
                id="invitationCode"
                className="w-full px-4 py-2 border border-black-300 rounded-lg"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="frontImage" className="block text-lg mb-2">
                صورة البطاقة (الوجه الأمامي)
              </label>
              <input
                type="file"
                id="frontImage"
                accept="image/*"
                required
                className="w-full px-4 py-2 border border-black-300 rounded-lg"
                onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <label htmlFor="backImage" className="block text-lg mb-2">
                صورة البطاقة (الوجه الخلفي)
              </label>
              <input
                type="file"
                id="backImage"
                accept="image/*"
                required
                className="w-full px-4 py-2 border border-black-300 rounded-lg"
                onChange={(e) => setBackImage(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <label htmlFor="selfieImage" className="block text-lg mb-2">
                صورة شخصية مع البطاقة
              </label>
              <input
                type="file"
                id="selfieImage"
                accept="image/*"
                required
                className="w-full px-4 py-2 border border-black-300 rounded-lg"
                onChange={(e) => setSelfieImage(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent
                     rounded-md shadow-sm text-sm font-medium text-white bg-gray-900
                     hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2
                     focus:ring-gray-500 transition-colors"
            disabled={loading}
          >
            {loading ? "جاري إنشاء الحساب..." : "تسجيل"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
