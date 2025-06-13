import { NavLink } from "react-router-dom";
import "../App.css";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { role } = useAuth();

  let navItems: { href: string; label: string }[] = [];
  if (role === "election_commission") {
    navItems = [
      { href: "/election/create", label: "إنشاء انتخابات" },
      { href: "/election/manage", label: "إدارة الانتخابات" },
      { href: "/election/results", label: "إعلان النتائج" },
      // { href: "/audit/tally-verification", label: "تدقيق الانتخابات" },
      { href: "/users/manage", label: "مراجعة الشهادات" },
      { href: "/system/logs", label: "الاحداث" },
      { href: "/audits/voter-activity", label: "بيانات الناخبين" },
    ];
  } else if (role === "auditor") {
    navItems = [
      { href: "/election/manage", label: "إدارة الانتخابات" },
      { href: "/users/manage", label: "مراجعة الشهادات" },
      { href: "/system/logs", label: "الاحداث" },
      { href: "/audit/tally-verification", label: "تدقيق الانتخابات" },
      { href: "/audits/voter-activity", label: "بيانات الناخبين" },
    ];
  }

  return (
    <aside
      style={{ position: "sticky", maxHeight: "100vh" }}
      className="w-72 bg-gray-800 text-white p-5 min-h-screen sticky top-0"
    >
      <div className="logo">
        <img src="/logo.png" className="logo" alt="" />
      </div>
      <h2 className="text-xl font-semibold mb-6  border-b border-gray-700 pb-3">
        لوحة التحكم
      </h2>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `block py-2 px-3 rounded transition-colors ${
                isActive
                  ? "bg-yellow-500 text-gray-900 font-medium"
                  : "hover:bg-gray-700"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
