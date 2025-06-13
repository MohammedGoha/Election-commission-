import { useState, useEffect } from "react";
import API_BASE from "../assets/glob";
import { useAuth } from "../context/AuthContext";
export default function LoginPage(props: any) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { login } = useAuth();
  // On mount: check if private key exists but access token is missing/expired
  useEffect(() => {
    const privateKey = localStorage.getItem("private_key");
    const accessToken = localStorage.getItem("access_token");

    // Optional: check if token is expired (here we just check presence)

    if (!accessToken && privateKey) {
      // Let user log in with phone to get new access token
    } else if (accessToken && privateKey) {
      // props.getMeIn(); // Already logged in
      login();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (!response.ok) throw new Error("Failed to login");

      const data = await response.json();

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        // props.getMeIn(); // Navigate into app
        login();
      } else {
        throw new Error("No access token returned");
      }
    } catch (err) {
      console.log(err);
      setError(true);
      setLoading(false);
    }
  };

  if (error)
    setTimeout(() => {
      setError(false);
      console.log(error);
    }, 5000);

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
              فشل تسجيل الدخول. تأكد من صحة الرقم.
            </div>
          )}

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EGY Vote</h1>
            <p className="text-gray-600">سجل الدخول للمتابعة</p>
          </div>

          <div className="space-y-4">
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
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent
                     rounded-md shadow-sm text-sm font-medium text-white bg-gray-900
                     hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2
                     focus:ring-gray-500 transition-colors"
          >
            {loading ? "جاري التحقق..." : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
