import { NavLink, useNavigate } from "react-router-dom";
import { MdLogout, MdPerson } from "react-icons/md";

import { classNames } from "../utils";
import { MdHome, MdScience } from "react-icons/md";
import store from "../store";
import api from "../services/api";

const navigation = [
  { name: "Home", to: "/home", icon: MdHome },
  { name: "Experiments", to: "/experiments", icon: MdScience },
];

export default function Sidebar() {
  const { user, setUser } = store();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (!confirm("Are you sure you want to logout?")) return;
      const { ok } = await api.post("/auth/logout");
      if (!ok) return;
      api.setToken("");
      setUser(null);
      navigate("/auth");
    } catch (e) {
      console.log("e", e);
    }
  };

  return (
    <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-48 xl:flex-col">
      <div className="flex grow flex-col gap-y-1 overflow-y-auto bg-primary px-2 ring-1 ring-white/5">
        <div className="flex shrink-0 items-center py-2">
          <h1 className="ml-2 text-white tracking-widest">EMS</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className=" space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      className={({ isActive }) =>
                        classNames(
                          isActive
                            ? "bg-white/20 text-white"
                            : "text-gray-200 hover:text-white hover:bg-white/10",
                          "group flex gap-x-3 rounded-md px-2 py-1 text-sm leading-6 items-center"
                        )
                      }
                      to={item.to}
                    >
                      <item.icon
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>

        {/* User Card */}
        <div className="flex shrink-0 border-t border-white/10 pt-2 pb-2">
          <div className="flex items-center gap-x-3 px-2 py-2 w-full">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <MdPerson className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex-shrink-0 p-1.5 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Log out"
            >
              <MdLogout className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
