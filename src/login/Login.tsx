import { useState } from "react";
import API_BASE from "../assets/glob";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null | boolean>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [step, setStep] = useState<"enter-password" | "logging-in">(
    "enter-password"
  );

  const handlePasswordSubmit = () => {
    const storedPassword = localStorage.getItem("password");
    if (!storedPassword) {
      setError("لم يتم العثور على كلمة المرور. الرجاء التسجيل أولاً.");
      return;
    }

    if (passwordInput !== storedPassword) {
      setError("كلمة المرور غير صحيحة.");
      return;
    }

    // Proceed to login if password is correct
    setStep("logging-in");
    setError(null);
    loginWithChallenge();
  };

  const loginWithChallenge = async () => {
    const userId = localStorage.getItem("user_id");
    const privateKeyPem = localStorage.getItem("private_key");

    if (!userId || !privateKeyPem) {
      setError("البيانات مفقودة. الرجاء التسجيل أولاً.");
      return;
    }

    try {
      // Step 1: Get challenge
      const challengeRes = await fetch(`${API_BASE}/auth/login/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!challengeRes.ok) {
        throw new Error("فشل في طلب التحدي");
      }

      const { challenge } = await challengeRes.json();

      // Step 2: Import private key
      const importedKey = await importPrivateKey(privateKeyPem);

      // Step 3: Sign the challenge
      const challengeBytes = hexToUint8Array(challenge);
      const hash = await crypto.subtle.digest("SHA-256", challengeBytes);
      const signatureBuffer = await crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        importedKey,
        hash
      );

      const signatureBase64 = btoa(
        String.fromCharCode(...new Uint8Array(signatureBuffer))
      );

      // Step 4: Send signed challenge
      const verifyRes = await fetch(`${API_BASE}/auth/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          challenge,
          signature: signatureBase64,
        }),
      });

      if (!verifyRes.ok) {
        throw new Error("فشل التحقق من التحدي");
      }

      const { access_token } = await verifyRes.json();
      localStorage.setItem("access_token", access_token);
      login();
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول");
      console.error(err);
      setStep("enter-password");
    }
  };

  const importPrivateKey = async (pem: string) => {
    const pemBody = pem
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s+/g, "");
    const binary = atob(pemBody);
    const binaryArray = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return await crypto.subtle.importKey(
      "pkcs8",
      binaryArray.buffer,
      {
        name: "ECDSA",
        namedCurve: "P-256",
        hash: { name: "SHA-256" },
      },
      true,
      ["sign"]
    );
  };

  const hexToUint8Array = (hex: string): Uint8Array => {
    const matches = hex.match(/.{1,2}/g);
    return matches
      ? new Uint8Array(matches.map((b) => parseInt(b, 16)))
      : new Uint8Array();
  };

  if (error) {
    setTimeout(() => {
      setError(false);
      console.log(error);
    }, 5000);
  }

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
        <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="text-red-600 text-center font-semibold">
              {error}
            </div>
          )}

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EGY Vote</h1>
            <p className="text-gray-600">سجل الدخول للمتابعة</p>
          </div>

          {step === "enter-password" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-lg mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  className="w-full px-4 py-2 border border-black-300 rounded-lg"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>

              <button
                onClick={handlePasswordSubmit}
                className="w-full flex justify-center py-2 px-4 border border-transparent
                         rounded-md shadow-sm text-sm font-medium text-white bg-gray-900
                         hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2
                         focus:ring-gray-500 transition-colors"
              >
                تحقق من كلمة المرور
              </button>
            </div>
          )}

          {step === "logging-in" && (
            <div className="text-center py-4">
              <p className="text-gray-700 font-medium">جاري تسجيل الدخول...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
