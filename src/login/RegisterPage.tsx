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

interface FormErrors {
  nationalId?: string;
  phone?: string;
  governorate?: string;
  invitationCode?: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [password, setpassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      login();
      navigate("/");
    }
  }, []);

  const validateNationalId = (id: string): boolean => {
    const nationalIdRegex = /^[23]\d{13}$/;
    return nationalIdRegex.test(id);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^0\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!nationalId) {
      newErrors.nationalId = "الرقم القومي مطلوب";
      isValid = false;
    } else if (!validateNationalId(nationalId)) {
      newErrors.nationalId = "الرقم القومي يجب أن يكون 14 رقم ويبدأ بـ 2 أو 3";
      isValid = false;
    }

    if (!phone) {
      newErrors.phone = "رقم الهاتف مطلوب";
      isValid = false;
    } else if (!validatePhone(phone)) {
      newErrors.phone = "رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 0";
      isValid = false;
    }

    if (!governorate) {
      newErrors.governorate = "يرجى اختيار المحافظة";
      isValid = false;
    }

    if (!invitationCode) {
      newErrors.invitationCode = "كود الدعوة مطلوب";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem("password", password);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          national_id: nationalId,
          phone,
          governorate,
          invitation_code: invitationCode,
        }),
      });

      const result = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(result.message || result.error || "فشل التسجيل");
      }

      localStorage.setItem("access_token", result.access_token);
      localStorage.setItem("certificate", result.certificate);
      localStorage.setItem("private_key", result.private_key);
      localStorage.setItem("user_id", result.user_id);
      localStorage.setItem("password", password);

      login();
      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("حدث خطأ غير متوقع");
      }
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EGY Vote</h1>
            <p className="text-gray-600">سجل حساب جديد</p>
          </div>
          {formError && (
            <div className="bg-red-100 text-red-700 p-3 rounded text-sm text-center">
              {formError}
            </div>
          )}  
          <div className="space-y-4">
            <div>
              <label htmlFor="national_id" className="block text-lg mb-2">
                الرقم القومي
              </label>
              <input
                type="text"
                id="national_id"
                required
                pattern="[23]\d{13}"
                title="يجب أن يبدأ الرقم القومي بـ 2 أو 3 ويتكون من 14 رقم"
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.nationalId ? "border-red-500" : "border-black-300"
                }`}
                value={nationalId}
                onChange={(e) => {
                  setNationalId(e.target.value);
                  setErrors({ ...errors, nationalId: undefined });
                  setFormError(null);
                }}
                placeholder="الرقم القومي (14 رقم)"
              />
              {errors.nationalId && (
                <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-lg mb-2">
                رقم الهاتف
              </label>
              <input
                type="text"
                id="phone"
                required
                pattern="0\d{10}"
                title="يجب أن يبدأ رقم الهاتف بـ 0 ويتكون من 11 رقم"
                className="w-full px-4 py-2 border border-black-300 rounded-lg"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors({ ...errors, phone: undefined });
                }}
                placeholder="رقم الهاتف (يبدأ بـ 0)"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="governorate" className="block text-lg mb-2">
                المحافظة
              </label>
              <select
                id="governorate"
                required
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.governorate ? "border-red-500" : "border-black-300"
                }`}
                value={governorate}
                onChange={(e) => {
                  setGovernorate(e.target.value);
                  setErrors({ ...errors, governorate: undefined });
                }}
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
              {errors.governorate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.governorate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="invitationCode" className="block text-lg mb-2">
                كود الدعوة
              </label>
              <input
                type="text"
                id="invitationCode"
                required
                className={`w-full px-4 py-2 border rounded-lg ${
                  errors.invitationCode ? "border-red-500" : "border-black-300"
                }`}
                value={invitationCode}
                onChange={(e) => {
                  setInvitationCode(e.target.value);
                  setErrors({ ...errors, invitationCode: undefined });
                }}
                placeholder="أدخل كود الدعوة"
              />
              {errors.invitationCode && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.invitationCode}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="invitationCode" className="block text-lg mb-2">
                كلمة السر
              </label>
              <input
                type="password"
                id="password"
                required
                className={`w-full px-4 py-2 border rounded-lg`}
                placeholder="password"
                value={password}
                onChange={(e) => {
                  setpassword(e.target.value);
                  console.log(password);
                }}
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
