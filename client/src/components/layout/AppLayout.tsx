import mapjiriWordmark from "@/assets/mapjiri-wordmark.svg";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Bot,
  Building2,
  Home,
  Trophy,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "홈화면", icon: Home, active: ["/"] },
  { href: "/recommendation", label: "공모전&세미나", icon: Trophy, active: ["/recommendation", "/contests", "/events"] },
  { href: "/recruitment", label: "모집", icon: Users, active: ["/recruitment", "/studies"] },
  { href: "/rentals", label: "대관", icon: Building2, active: ["/rentals", "/rental", "/rooms"] },
  { href: "/mentors", label: "상담", icon: Bot, active: ["/mentors", "/mentors/schedule", "/mentors/chat", "/schedule", "/chat"] },
  { href: "/mypage", label: "마이페이지", icon: UserCircle, active: ["/mypage", "/coins", "/onboarding"] },
];

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center px-4">
          <Link to="/" className="flex items-center" aria-label="Mapjiri 홈">
            <img src={mapjiriWordmark} alt="Mapjiri" className="h-10 w-auto" />
          </Link>
        </div>

        <nav className="mx-auto flex w-full max-w-[1180px] justify-between gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active.includes(location.pathname);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "inline-flex h-9 min-w-[104px] flex-1 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-4 py-6">
        <div key={location.pathname} className="animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
