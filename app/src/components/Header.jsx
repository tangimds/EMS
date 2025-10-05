import { NavLink, useNavigate } from "react-router-dom";
import { MdLogout, MdPerson, MdMenu, MdClose } from "react-icons/md";
import { useState } from "react";

import { classNames } from "../utils";
import { MdHome, MdScience } from "react-icons/md";
import store from "../store";
import api from "../services/api";
import { Link } from "react-router-dom";

const navigation = [
  { name: "Home", to: "/home", icon: MdHome },
  { name: "Experiments", to: "/experiments", icon: MdScience },
];

export default function Header() {
  const { setUser } = store();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="xl:hidden">
      {/* Mobile Header Bar */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/home"
            className="text-white tracking-widest text-lg font-semibold"
          >
            EMS
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Menu Toggle Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <MdClose className="h-6 w-6" />
            ) : (
              <MdMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="bg-primary border-t border-white/10">
          <nav className="px-4 py-2">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-gray-200 hover:text-white hover:bg-white/10",
                        "group flex gap-x-3 rounded-md px-3 py-2 text-sm leading-6 items-center"
                      )
                    }
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon
                      className="h-5 w-5 shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="px-4 py-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-x-3 px-3 py-2 text-sm text-gray-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              <MdLogout className="h-5 w-5" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
