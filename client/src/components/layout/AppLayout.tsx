import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  Home,
  LogOut,
  MessageCircle,
  Sparkles,
  Trophy,
  User as UserIcon,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/", label: "홈", icon: Home, active: ["/"] },
  { href: "/recommendation", label: "공모전", icon: Trophy, active: ["/recommendation", "/contests", "/events"] },
  { href: "/recruitment", label: "모집", icon: Users, active: ["/recruitment", "/studies"] },
  { href: "/team-matching", label: "팀 매칭", icon: Sparkles, active: ["/team-matching", "/teams"] },
  { href: "/mentors", label: "멘토링", icon: Bot, active: ["/mentors", "/mentors/schedule", "/mentors/chat", "/schedule", "/chat"] },
  { href: "/community", label: "커뮤니티", icon: MessageCircle, active: ["/community", "/board", "/clubs"] },
  { href: "/ai-matching", label: "AI 추천", icon: Sparkles, active: ["/ai-matching", "/ai-match", "/portfolio"] },
  { href: "/mypage", label: "마이", icon: UserCircle, active: ["/mypage", "/coins", "/onboarding"] },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, login, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-black text-white shadow-sm">
              U
            </div>
            <div>
              <div className="text-lg font-black leading-none tracking-tight">UniLink</div>
              <div className="text-[11px] font-semibold text-slate-500">campus career hub</div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <button
                onClick={login}
                className="mr-4 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:mr-0"
              >
                <UserIcon className="h-4 w-4" />
                <span className="hidden sm:inline">로그인</span>
              </button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 outline-none transition-colors hover:bg-slate-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-black text-white">
                    SJ
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-lg">
                  <div className="border-b border-slate-100 px-2 py-2 text-sm font-semibold text-slate-600">
                    김세종님 환영합니다
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/mypage")} className="cursor-pointer font-medium">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>마이페이지</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer font-medium text-red-500 focus:bg-red-50 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <nav className="mx-auto flex w-full max-w-[1180px] gap-1 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active.includes(location.pathname);

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-bold transition-colors",
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
