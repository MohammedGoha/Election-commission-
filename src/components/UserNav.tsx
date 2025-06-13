// components/UserNav.tsx
import { NavLink } from "react-router-dom";

const UserNav = () => {
  const linkClass =
    "block px-4 py-2 rounded hover:bg-blue-100 text-gray-800 font-medium";

  return (
    <div className="w-64 bg-white border-r min-h-screen p-4 space-y-2 shadow">
      <h2 className="text-xl font-bold mb-4 text-blue-600">إدارة المستخدمين</h2>
      <NavLink to="/users/all" className={linkClass}>
        عرض كل المستخدمين
      </NavLink>
      <NavLink to="/users/view" className={linkClass}>
        عرض مستخدم واحد
      </NavLink>
      <NavLink to="/users/certificate" className={linkClass}>
        عرض شهادة المستخدم
      </NavLink>
      <NavLink to="/users/revoke" className={linkClass}>
        إلغاء مستخدم
      </NavLink>
      <NavLink to="/users/revocations" className={linkClass}>
        سجل الإلغاءات
      </NavLink>
    </div>
  );
};

export default UserNav;
