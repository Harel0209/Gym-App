import { Outlet, NavLink } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Icon from "./Icon";

const NAV_ITEMS = [
  { to: "/", icon: "home", label: "Home" },
  { to: "/planner", icon: "calendar_today", label: "Planner" },
  { to: "/progress", icon: "monitoring", label: "Progress" },
];

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 transition-colors ${
          isActive ? "text-primary" : "text-neutral-soft hover:text-neutral-med"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={icon} filled={isActive} className="text-2xl" />
          <span className="text-[10px] font-bold">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const { currentUser, logout } = useUser();

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-neutral-strong font-display">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 py-4 bg-bg-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-soft/20">
        <button
          onClick={logout}
          title="Switch profile"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
        >
          {currentUser?.[0]?.toUpperCase() || "?"}
        </button>

        <h1 className="text-xl font-bold tracking-tight">GymApp</h1>

        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
          <Icon name="more_vert" className="text-neutral-strong" />
        </button>
      </header>

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-y-auto pb-28">
        <Outlet />
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-dark/90 backdrop-blur-xl border-t border-neutral-soft/20 px-6 py-3 flex justify-between items-center z-50">
        {NAV_ITEMS.slice(0, 2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}


        {NAV_ITEMS.slice(2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
}
