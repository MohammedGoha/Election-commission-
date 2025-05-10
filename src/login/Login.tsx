import { useState, useEffect } from "react";

export default function LoginPage(props: any) {
  const [email, setEmail] = useState("");
  const [certContent, setCertContent] = useState("");
  const [keyContent, setKeyContent] = useState("");
  const [right, setRight] = useState(false);
  const [loading, setLoading] = useState(false);

  const testEmail = "mohamed Goha";
  const testcert = `-----BEGIN CERTIFICATE-----
MIIB8TCCAZegAwIBAgIUfX3XGpWqD1CQEKn9uHp1EHz1ZaswCgYIKoZIzj0EAwIw
EDEOMAwGA1UEAwwFdm90ZWNodTAeFw0yNTA1MDcwMDAwMDBaFw0yNTA1MDgwMDAw
MDBaMBAxDjAMBgNVBAMMBXZvdGVjaHUwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNC
AAQ8f6zW93C0Dbp3kxSRkVDbzKyr28s9kHJuJDngEjX8iTv5+NDxLyZmOaMvIV8X
j3H2OEn4npGp7yja/5ItRP2Vo1MwUTAdBgNVHQ4EFgQUrH6E67/0BRoLQjof73q8
YXq3gCswHwYDVR0jBBgwFoAUrH6E67/0BRoLQjof73q8YXq3gCswDwYDVR0TAQH/
BAUwAwEB/zAKBggqhkjOPQQDAgNIADBFAiEApwmdnv2YPR+hOIgCy5ePj2KiKTb9
2rM0ZgYftmIDDFo8CICPl/jkEBYV3dcFAjsNGoZGpQmsq1I7lL3Pj3hMRRngn
-----END CERTIFICATE-----
`;
  const testprivatekey = `
-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgNcEcVqM72ZyMWb8F
xssRkuK3R7gRuRGCfP/FeHCSvAChRANCAAQ8f6zW93C0Dbp3kxSRkVDbzKyr28s9
kHJuJDngEjX8iTv5+NDxLyZmOaMvIV8Xj3H2OEn4npGp7yja/5ItRP2V
-----END PRIVATE KEY-----
`;
  // Auto login if cert/key exist in localStorage
  useEffect(() => {
    const savedCert = localStorage.getItem("cert");
    const savedKey = localStorage.getItem("key");
    if (
      savedCert?.trim().replace(/(\r\n|\n|\r)/gm, "") ==
        testcert.trim().replace(/(\r\n|\n|\r)/gm, "") &&
      savedKey?.trim().replace(/(\r\n|\n|\r)/gm, "") ==
        testprivatekey.trim().replace(/(\r\n|\n|\r)/gm, "")
    ) {
      props.getMeIn();
    }
  }, []);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cert" | "key"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (type === "cert") setCertContent(content);
      else setKeyContent(content);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const valid =
        email === testEmail &&
        certContent.trim().replace(/(\r\n|\n|\r)/gm, "") ==
          testcert.trim().replace(/(\r\n|\n|\r)/gm, "") &&
        keyContent.trim().replace(/(\r\n|\n|\r)/gm, "") ==
          testprivatekey.trim().replace(/(\r\n|\n|\r)/gm, "");
      console.log(
        certContent.trim().replace(/(\r\n|\n|\r)/gm, "") ==
          testcert.trim().replace(/(\r\n|\n|\r)/gm, "")
      );
      console.log(
        keyContent.trim() == testprivatekey.trim().replace(/(\r\n|\n|\r)/gm, "")
      );
      if (valid) {
        localStorage.setItem(
          "cert",
          certContent.trim().replace(/(\r\n|\n|\r)/gm, "")
        );
        localStorage.setItem(
          "key",
          keyContent.trim().replace(/(\r\n|\n|\r)/gm, "")
        );
        props.getMeIn();
      } else {
        setRight(true);
        setLoading(false);
      }
    }, 1000);
  };

  if (right) setTimeout(() => setRight(false), 5000);

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
          {right && (
            <div className="text-red-600 text-center font-semibold">
              البيانات غير صحيحة أو مفقودة
            </div>
          )}

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">EGY Vote</h1>
            <p className="text-gray-600">سجل الدخول للمتابعة</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-lg mb-2">
                اسم المستخدم
              </label>
              <input
                type="text"
                id="email"
                required
                className="w-full px-4 py-2 border border-black-300 rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="certFile" className="block text-lg mb-2">
                شهادة الدخول (Certificate)
              </label>
              <input
                type="file"
                id="certFile"
                accept=".pem,.crt,.cert,.txt"
                onChange={(e) => handleFileChange(e, "cert")}
                className="w-full px-4 py-2 border border-black-300 rounded-lg bg-white"
                required
              />
            </div>

            <div>
              <label htmlFor="keyFile" className="block text-lg mb-2">
                المفتاح الخاص (Private Key)
              </label>
              <input
                type="file"
                id="keyFile"
                accept=".pem,.key,.txt"
                onChange={(e) => handleFileChange(e, "key")}
                className="w-full px-4 py-2 border border-black-300 rounded-lg bg-white"
                required
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
