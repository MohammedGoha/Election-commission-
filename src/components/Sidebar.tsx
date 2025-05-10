import { NavLink } from "react-router-dom";
import "../App.css";
const Sidebar = () => {
  const navItems = [
    { href: "/election/create", label: "إنشاء انتخابات" },
    { href: "/currentElection", label: "الانتخابات الحالية" },
    { href: "/election/manage", label: "إدارة الانتخابات" },
    { href: "/voters/participation", label: "سجل مشاركة الناخبين" },
    { href: "/election/results", label: "إعلان النتائج" },
    { href: "/audits/logs", label: "سجلات المراجعة" },
    { href: "/security/alerts", label: "تنبيهات الأمان" },
  ];

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
