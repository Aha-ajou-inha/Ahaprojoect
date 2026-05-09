import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Coins,
  List,
  MessageCircle,
  MoreHorizontal,
  PencilLine,
  PhoneCall,
  Send,
  Smile,
  Paperclip,
  Phone,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getConsultCoinCost, getGrowthLevel, growthLevels } from "@/lib/roadin";

type ConsultTab = "write" | "list" | "messages";
type ConsultingField = "취업" | "진로/커리어" | "스펙/자격증" | "대학생활" | "기타";
type ConsultingMethod = "채팅" | "음성 통화" | "대면 상담";
type ConcernStatus = "답변 대기" | "상담중" | "답변 완료";
type ThreadStage = "매칭 요청" | "상담중" | "답변 완료";
type Sender = "user" | "tutor" | "system";

type ConcernDraft = {
  title: string;
  content: string;
  fields: ConsultingField[];
  method: ConsultingMethod;
};

type Concern = {
  id: string;
  title: string;
  content: string;
  summary: string;
  fields: ConsultingField[];
  method: ConsultingMethod;
  status: ConcernStatus;
  level: number;
  createdAt: number;
  threadId?: string;
};

type Tutor = {
  id: string;
  name: string;
  school: string;
  major: string;
  year: string;
  level: number;
  tags: string[];
  focus: ConsultingField[];
  intro: string;
  avatarColor: string;
  avatarText: string;
};

type Message = {
  id: string;
  sender: Sender;
  text: string;
  createdAt: number;
};

type MatchThread = {
  id: string;
  concernId: string;
  tutorId: string;
  stage: ThreadStage;
  selectedMinutes: number;
  paymentConfirmed: boolean;
  unreadCount: number;
  lastUpdatedAt: number;
  messages: Message[];
};

const ROADIN_USER = { name: "김맵지", coins: 750 };
const COUNSEL_FIELDS: ConsultingField[] = ["취업", "진로/커리어", "스펙/자격증", "대학생활", "기타"];
const TIME_OPTIONS = [10, 20, 30, 40, 50, 60];
const EMPTY_DRAFT: ConcernDraft = { title: "", content: "", fields: ["진로/커리어"], method: "채팅" };

const STORAGE_KEYS = {
  concerns: "roadin-consult-concerns-v3",
  threads: "roadin-consult-threads-v3",
  draft: "roadin-consult-draft-v3",
  coins: "roadin-consult-coins-v3",
};

const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const MINUTE_MS = 60000;

const METHOD_META: Record<ConsultingMethod, { icon: LucideIcon; label: string }> = {
  채팅: { icon: MessageCircle, label: "채팅" },
  "음성 통화": { icon: PhoneCall, label: "음성 통화" },
  "대면 상담": { icon: Users, label: "대면 상담" },
};

const STATUS_META: Record<ConcernStatus, { icon: LucideIcon; tone: string; border: string }> = {
  "답변 대기": { icon: Clock3, tone: "text-slate-600 bg-slate-50", border: "border-slate-200" },
  상담중: { icon: MessageCircle, tone: "text-green-600 bg-green-50", border: "border-green-200" },
  "답변 완료": { icon: CheckCircle2, tone: "text-blue-600 bg-blue-50", border: "border-blue-200" },
};

const TUTORS: Tutor[] = [
  { id: "tutor-jiyu", name: "박지우 튜터", school: "연세대학교", major: "경영학과", year: "4학년", level: 1, tags: ["데이터 분석", "마케팅"], focus: ["진로/커리어", "기타"], intro: "막막한 고민을 작게 쪼개서 다음 액션으로 연결해드릴게요.", avatarColor: "bg-blue-100 text-blue-700", avatarText: "박" },
  { id: "tutor-jiwon", name: "이지연 튜터", school: "성균관대학교", major: "교육학과", year: "3학년", level: 2, tags: ["대학생활", "시간 관리"], focus: ["대학생활", "기타"], intro: "학교생활과 대외활동을 병행하는 루틴 설계를 도와드려요.", avatarColor: "bg-pink-100 text-pink-700", avatarText: "이" },
  { id: "tutor-minho", name: "최민호 튜터", school: "한양대학교", major: "컴퓨터공학과", year: "4학년", level: 3, tags: ["취업", "포트폴리오"], focus: ["취업", "스펙/자격증"], intro: "포트폴리오와 프로젝트 경험을 취업 언어로 번역해드릴게요.", avatarColor: "bg-slate-200 text-slate-700", avatarText: "최" },
  { id: "tutor-seoyeon", name: "박서연 튜터", school: "중앙대학교", major: "산업디자인학과", year: "3학년", level: 4, tags: ["AI 기획", "프로젝트"], focus: ["진로/커리어", "기타"], intro: "아이디어를 실제 프로젝트 주제로 바꾸는 흐름을 함께 잡아드려요.", avatarColor: "bg-amber-100 text-amber-700", avatarText: "서" },
  { id: "tutor-haneul", name: "윤하늘 튜터", school: "고려대학교", major: "심리학과", year: "졸업", level: 5, tags: ["커리어 로드맵", "장기 전략"], focus: ["취업", "진로/커리어"], intro: "당장 필요한 답과 장기적인 방향을 함께 설계해드릴게요.", avatarColor: "bg-violet-100 text-violet-700", avatarText: "윤" },
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function buildSummary(content: string) {
  const s = content.replace(/\s+/g, " ").trim();
  return s.length <= 60 ? s : `${s.slice(0, 60).trim()}...`;
}

function getLevelMeta(level: number) {
  return growthLevels.find((l) => l.level === level) ?? growthLevels[0];
}

function pickTutor(fields: ConsultingField[]): Tutor {
  const p = fields[0] ?? "기타";
  if (p === "취업" || p === "스펙/자격증") return TUTORS[2];
  if (p === "대학생활") return TUTORS[1];
  if (p === "진로/커리어") return TUTORS[4];
  return TUTORS[3];
}

function createSeedConcerns(): Concern[] {
  const now = Date.now();
  return [
    { id: "concern-1", title: "진로 방향을 어떻게 잡아야 할지 고민이에요", content: "법무학과 수업을 듣고 있는데 어떤 분야를 더 깊게 준비해야 할지 막막해요.", summary: "법무학과 수업을 듣고 있는데 어떤 분야를 더 깊게 준비해야 할지 막막해요.", fields: ["진로/커리어", "대학생활"], method: "채팅", status: "답변 대기", level: 1, createdAt: now - DAY_MS * 8 },
    { id: "concern-2", title: "학교생활과 프로젝트를 병행하는 방법이 궁금해요", content: "수업, 팀플, 대외활동을 함께 하려니 시간 관리가 너무 어려워요.", summary: "수업, 팀플, 대외활동을 함께 하려니 시간 관리가 너무 어려워요.", fields: ["대학생활", "기타"], method: "채팅", status: "상담중", level: 2, createdAt: now - DAY_MS * 6, threadId: "thread-2" },
    { id: "concern-3", title: "포트폴리오에 어떤 프로젝트를 넣어야 할까요?", content: "AI 분야를 희망하는데 어떤 결과물이 취업 준비에 도움이 될지 잘 모르겠어요.", summary: "AI 분야를 희망하는데 어떤 결과물이 취업 준비에 도움이 될지 잘 모르겠어요.", fields: ["스펙/자격증", "취업"], method: "음성 통화", status: "답변 완료", level: 3, createdAt: now - DAY_MS * 5, threadId: "thread-3" },
    { id: "concern-4", title: "AI 프로젝트 주제 추천을 받고 싶어요", content: "인공지능에 관심이 있어서 인턴 준비용 프로젝트를 만들고 싶은데 주제를 못 정했어요.", summary: "인공지능에 관심이 있어서 인턴 준비용 프로젝트를 만들고 싶은데 주제를 못 정했어요.", fields: ["기타", "진로/커리어"], method: "채팅", status: "상담중", level: 4, createdAt: now - DAY_MS * 4, threadId: "thread-4" },
    { id: "concern-5", title: "취업 준비 로드맵을 구체적으로 알고 싶어요", content: "인턴, 공모전, 자격증, 포트폴리오 등어떤 순서로 준비하면 좋을지 조언이 필요해요.", summary: "인턴, 공모전, 자격증, 포트폴리오 등어떤 순서로 준비하면 좋을지 조언이 필요해요.", fields: ["취업", "스펙/자격증"], method: "대면 상담", status: "답변 완료", level: 5, createdAt: now - DAY_MS * 3, threadId: "thread-5" },
  ];
}

function createSeedThreads(): MatchThread[] {
  const now = Date.now();
  return [
    {
      id: "thread-4", concernId: "concern-4", tutorId: "tutor-jiyu", stage: "매칭 요청",
      selectedMinutes: 20, paymentConfirmed: false, unreadCount: 1,
      lastUpdatedAt: now - 5 * MINUTE_MS,
      messages: [
        { id: "m-41", sender: "system", text: "박지우 튜터에게 매칭을 요청했어요. 희망 상담 시간을 고르면 바로 상담을 확정할 수 있어요.", createdAt: now - 10 * MINUTE_MS },
        { id: "m-42", sender: "tutor", text: "안녕하세요! 고민 내용을 보고 도움을 드리고 싶어 매칭을 요청드립니다.", createdAt: now - 5 * MINUTE_MS },
      ],
    },
    {
      id: "thread-jiwon", concernId: "concern-2", tutorId: "tutor-jiwon", stage: "매칭 요청",
      selectedMinutes: 20, paymentConfirmed: false, unreadCount: 0,
      lastUpdatedAt: now - HOUR_MS,
      messages: [
        { id: "m-jw1", sender: "tutor", text: "저의 경험이 도움이 될 것 같아 매칭을 요청드립니다!", createdAt: now - HOUR_MS },
      ],
    },
    {
      id: "thread-minho", concernId: "concern-4", tutorId: "tutor-minho", stage: "매칭 요청",
      selectedMinutes: 20, paymentConfirmed: false, unreadCount: 0,
      lastUpdatedAt: now - 2 * HOUR_MS,
      messages: [
        { id: "m-sys1", sender: "system", text: "이지연 튜터님과의 매칭 요청이 수락되었습니다! 🎉", createdAt: now - 2 * HOUR_MS },
      ],
    },
    {
      id: "thread-2", concernId: "concern-2", tutorId: "tutor-minho", stage: "매칭 요청",
      selectedMinutes: 20, paymentConfirmed: false, unreadCount: 0,
      lastUpdatedAt: now - DAY_MS,
      messages: [
        { id: "m-sys2", sender: "system", text: "박서연 튜터님과의 매칭 요청이 수락되었습니다! 🎉", createdAt: now - DAY_MS },
      ],
    },
    {
      id: "thread-3", concernId: "concern-3", tutorId: "tutor-minho", stage: "답변 완료",
      selectedMinutes: 30, paymentConfirmed: true, unreadCount: 0,
      lastUpdatedAt: now - DAY_MS,
      messages: [
        { id: "m-31", sender: "system", text: "최민호 튜터와 30분 음성 상담이 완료되었어요.", createdAt: now - DAY_MS * 2 },
        { id: "m-32", sender: "tutor", text: "포트폴리오에는 기술만 나열하기보다 해결한 문제와 결과 지표를 함께 적는 편이 좋아요.", createdAt: now - DAY_MS * 2 + HOUR_MS },
        { id: "m-33", sender: "user", text: "그럼 학부 프로젝트도 문제 정의와 개선 결과를 중심으로 묶어보겠습니다. 감사합니다!", createdAt: now - DAY_MS },
      ],
    },
    {
      id: "thread-5", concernId: "concern-5", tutorId: "tutor-haneul", stage: "답변 완료",
      selectedMinutes: 30, paymentConfirmed: true, unreadCount: 0,
      lastUpdatedAt: now - DAY_MS,
      messages: [
        { id: "m-51", sender: "system", text: "윤하늘 튜터와의 상담이 완료되었어요.", createdAt: now - DAY_MS * 3 },
      ],
    },
  ];
}

function formatDateLabel(ts: number) {
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function formatTimeLabel(ts: number) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatRelativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < HOUR_MS) return `${Math.max(1, Math.round(diff / MINUTE_MS))}분 전`;
  if (diff < DAY_MS) return `${Math.max(1, Math.round(diff / HOUR_MS))}시간 전`;
  return "어제";
}

function TutorAvatar({ tutor, size = "md" }: { tutor: Tutor; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-9 w-9 text-sm" : size === "lg" ? "h-14 w-14 text-xl" : "h-11 w-11 text-base";
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full font-black", tutor.avatarColor, sizeClass)}>
      {tutor.avatarText}
    </div>
  );
}

export function Mentors() {
  const [activeTab, setActiveTab] = useState<ConsultTab>("write");
  const [draft, setDraft] = useState<ConcernDraft>(() => readStored(STORAGE_KEYS.draft, EMPTY_DRAFT));
  const [concerns, setConcerns] = useState<Concern[]>(() => readStored(STORAGE_KEYS.concerns, createSeedConcerns()));
  const [threads, setThreads] = useState<MatchThread[]>(() => readStored(STORAGE_KEYS.threads, createSeedThreads()));
  const [coinBalance, setCoinBalance] = useState<number>(() => readStored(STORAGE_KEYS.coins, ROADIN_USER.coins));
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [formError, setFormError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<ConsultTab>("write");
  const selectedThreadRef = useRef<string | null>(null);
  const replyTimeoutsRef = useRef<number[]>([]);

  const currentLevel = getGrowthLevel(coinBalance);
  const orderedConcerns = [...concerns].sort((a, b) => b.createdAt - a.createdAt);
  const orderedThreads = [...threads].sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
  const selectedThread = orderedThreads.find((t) => t.id === selectedThreadId) ?? orderedThreads[0] ?? null;
  const selectedConcern = concerns.find((c) => c.id === selectedThread?.concernId) ?? null;
  const selectedTutor = TUTORS.find((t) => t.id === selectedThread?.tutorId) ?? null;
  const selectedCost = selectedThread && selectedTutor ? getConsultCoinCost(selectedThread.selectedMinutes, selectedTutor.level) : 0;

  const totalConcerns = concerns.length;
  const waitingConcerns = concerns.filter((c) => c.status === "답변 대기").length;
  const inProgressConcerns = concerns.filter((c) => c.status === "상담중").length;
  const doneConcerns = concerns.filter((c) => c.status === "답변 완료").length;

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { selectedThreadRef.current = selectedThreadId; }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId && orderedThreads.length > 0) setSelectedThreadId(orderedThreads[0].id);
  }, [orderedThreads, selectedThreadId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.concerns, JSON.stringify(concerns));
  }, [concerns]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.threads, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEYS.coins, JSON.stringify(coinBalance));
  }, [coinBalance]);

  useEffect(() => {
    if (activeTab === "messages" && selectedThreadId) {
      setThreads((prev) => prev.map((t) => t.id === selectedThreadId && t.unreadCount > 0 ? { ...t, unreadCount: 0 } : t));
    }
  }, [activeTab, selectedThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedThread?.messages]);

  useEffect(() => () => { replyTimeoutsRef.current.forEach((id) => window.clearTimeout(id)); }, []);

  function updateThread(threadId: string, updater: (t: MatchThread) => MatchThread) {
    setThreads((prev) => prev.map((t) => t.id === threadId ? updater(t) : t));
  }

  function queueTutorReply(threadId: string, concern: Concern, tutor: Tutor) {
    const tid = window.setTimeout(() => {
      const replies: Record<ConsultingField, string> = {
        취업: "취업 고민은 준비 순서를 정리하는 것만으로도 체감 부담이 크게 줄어들어요. 어떤 항목부터 시작할까요?",
        "진로/커리어": `${tutor.name} 기준으로 보면 진로 고민은 정답 찾기보다 후보를 좁히는 과정이 더 중요해요.`,
        "스펙/자격증": "스펙 고민은 목표 직무와 연결되는 경험만 선명하게 남기는 게 핵심이에요.",
        대학생활: "시간표, 팀플, 대외활동을 한 주 기준으로 다시 배치해보면 숨통이 트여요.",
        기타: "고민이 아직 넓게 잡혀 있어서, 하고 싶은 일과 피하고 싶은 일을 한 줄씩만 적어봐요.",
      };
      const text = replies[concern.fields[0] ?? "기타"];
      const msg: Message = { id: createId("msg"), sender: "tutor", text, createdAt: Date.now() };
      setThreads((prev) => prev.map((t) => {
        if (t.id !== threadId) return t;
        const isFocused = activeTabRef.current === "messages" && selectedThreadRef.current === threadId;
        return { ...t, messages: [...t.messages, msg], lastUpdatedAt: msg.createdAt, unreadCount: isFocused ? 0 : t.unreadCount + 1 };
      }));
    }, 1000);
    replyTimeoutsRef.current.push(tid);
  }

  function handleToggleField(field: ConsultingField) {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.includes(field) ? prev.fields.filter((f) => f !== field) : [...prev.fields, field],
    }));
  }

  function handleSaveConcern() {
    if (!draft.title.trim() || !draft.content.trim() || draft.fields.length === 0) {
      setFormError("제목, 고민 내용, 상담 분야를 모두 입력해주세요.");
      return;
    }
    const next: Concern = {
      id: createId("concern"), title: draft.title.trim(), content: draft.content.trim(),
      summary: buildSummary(draft.content), fields: draft.fields, method: draft.method,
      status: "답변 대기", level: currentLevel.level, createdAt: Date.now(),
    };
    setConcerns((prev) => [next, ...prev]);
    setDraft(EMPTY_DRAFT);
    setFormError("");
    setActiveTab("list");
  }

  function handleRequestMatch(concernId: string) {
    const concern = concerns.find((c) => c.id === concernId);
    if (!concern) return;
    const existing = threads.find((t) => t.concernId === concernId);
    if (existing) { setSelectedThreadId(existing.id); setActiveTab("messages"); return; }
    const tutor = pickTutor(concern.fields);
    const now = Date.now();
    const systemMsg: Message = { id: createId("msg"), sender: "system", text: `${tutor.name}에게 매칭을 요청했어요.`, createdAt: now };
    const thread: MatchThread = { id: createId("thread"), concernId: concern.id, tutorId: tutor.id, stage: "매칭 요청", selectedMinutes: 20, paymentConfirmed: false, unreadCount: 0, lastUpdatedAt: now, messages: [systemMsg] };
    setThreads((prev) => [thread, ...prev]);
    setConcerns((prev) => prev.map((c) => c.id === concernId ? { ...c, status: "상담중", threadId: thread.id } : c));
    setSelectedThreadId(thread.id);
    setActiveTab("messages");
    queueTutorReply(thread.id, concern, tutor);
  }

  function handleSendMessage() {
    if (!selectedThread || !selectedConcern || !selectedTutor) return;
    const text = messageDraft.trim();
    if (!text || selectedThread.stage === "답변 완료") return;
    const msg: Message = { id: createId("msg"), sender: "user", text, createdAt: Date.now() };
    updateThread(selectedThread.id, (t) => ({ ...t, messages: [...t.messages, msg], lastUpdatedAt: msg.createdAt, unreadCount: 0 }));
    setMessageDraft("");
    queueTutorReply(selectedThread.id, selectedConcern, selectedTutor);
  }

  function handleConfirmPayment() {
    if (!selectedThread || !selectedTutor || !selectedConcern || selectedThread.paymentConfirmed) return;
    const cost = getConsultCoinCost(selectedThread.selectedMinutes, selectedTutor.level);
    if (coinBalance < cost) { setPaymentError("코인이 부족합니다"); return; }
    const now = Date.now();
    const msg: Message = { id: createId("msg"), sender: "system", text: `${cost}코인이 차감되고 ${selectedThread.selectedMinutes}분 상담이 확정되었어요.`, createdAt: now };
    setCoinBalance((prev) => prev - cost);
    updateThread(selectedThread.id, (t) => ({ ...t, stage: "상담중", paymentConfirmed: true, messages: [...t.messages, msg], lastUpdatedAt: now }));
    setConcerns((prev) => prev.map((c) => c.id === selectedConcern.id ? { ...c, status: "상담중" } : c));
    setPaymentError("");
  }

  function handleCancelRequest() {
    if (!selectedThread || !selectedConcern || selectedThread.paymentConfirmed) return;
    setThreads((prev) => prev.filter((t) => t.id !== selectedThread.id));
    setConcerns((prev) => prev.map((c) => c.id === selectedConcern.id ? { ...c, status: "답변 대기", threadId: undefined } : c));
    setSelectedThreadId(null);
    setActiveTab("list");
  }

  const tabs = [
    { key: "write" as const, label: "고민작성", icon: PencilLine },
    { key: "list" as const, label: "고민 목록", icon: List },
    { key: "messages" as const, label: "매칭 메시지함", icon: MessageCircle },
  ];

  return (
    <div className="space-y-5 pb-10">
      <h1 className="text-3xl font-black text-slate-900">상담</h1>

      {/* 탭 */}
      <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex h-14 items-center justify-center gap-2 text-sm font-bold transition-colors",
                isActive ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-50",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 고민 작성 탭 */}
      {activeTab === "write" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">고민 장보를 작성해주세요!</h2>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">고민 제목</label>
                  <span className="text-xs text-slate-400">{draft.title.length} / 50</span>
                </div>
                <Input
                  maxLength={50}
                  value={draft.title}
                  onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                  placeholder="ex) 이력서 작성이 막막해요, 어떤 점을 개선해야 할까요?"
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">고민 내용</label>
                  <span className="text-xs text-slate-400">{draft.content.length} / 500</span>
                </div>
                <Textarea
                  maxLength={500}
                  value={draft.content}
                  onChange={(e) => setDraft((p) => ({ ...p, content: e.target.value }))}
                  placeholder="고민 내용을 자세히 적어주세요."
                  className="min-h-[140px] rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">상담 분야 <span className="text-xs font-normal text-slate-400">(복수 선택 가능)</span></label>
                <div className="flex flex-wrap gap-2">
                  {COUNSEL_FIELDS.map((field) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => handleToggleField(field)}
                      className={cn(
                        "rounded-full border px-5 py-2 text-sm font-bold transition-colors",
                        draft.fields.includes(field)
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50",
                      )}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">상담 방식</label>
                <div className="flex gap-3">
                  {(Object.keys(METHOD_META) as ConsultingMethod[]).map((method) => {
                    const { icon: Icon, label } = METHOD_META[method];
                    const selected = draft.method === method;
                    return (
                      <label key={method} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="method"
                          checked={selected}
                          onChange={() => setDraft((p) => ({ ...p, method }))}
                          className="accent-blue-600"
                        />
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className={cn("text-sm font-bold", selected ? "text-blue-600" : "text-slate-600")}>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {formError}
                </div>
              )}

              <Button className="h-12 w-full rounded-xl bg-blue-600 text-base font-black hover:bg-blue-700" onClick={handleSaveConcern}>
                등록하기
              </Button>
            </div>
          </div>

          {/* 우측 사이드 - AI 고민 키워드 + 맵지리 이미지 */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">AI 고민 키워드 분석</h3>
            <p className="mt-2 text-sm font-medium text-slate-500">AI가 고민 키워드를 분석해<br />적합한 멘토를 추천해드려요!</p>
            <div className="mt-8 flex flex-col items-center justify-center">
              <img src="/step4.png" alt="맵지리" className="h-48 w-48 object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* 고민 목록 탭 */}
      {activeTab === "list" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            {orderedConcerns.map((concern) => {
              const method = METHOD_META[concern.method];
              const status = STATUS_META[concern.status];
              const StatusIcon = status.icon;
              const MethodIcon = method.icon;
              const linkedThread = threads.find((t) => t.concernId === concern.id);

              return (
                <div key={concern.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow">
                  {/* 레벨 이미지 */}
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <img src={`/step${concern.level}.png`} alt={`Lv.${concern.level}`} className="h-16 w-16 object-contain" />
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-black text-white">
                      Lv.{concern.level} {getLevelMeta(concern.level).name}
                    </span>
                  </div>

                  {/* 내용 */}
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-black text-slate-900 line-clamp-1">{concern.title}</p>
                    <p className="mt-1 text-sm text-slate-500 line-clamp-2 leading-5">{concern.summary}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {concern.fields.map((f) => (
                        <span key={f} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">{f}</span>
                      ))}
                    </div>
                  </div>

                  {/* 메타 정보 */}
                  <div className="shrink-0 space-y-2 text-right">
                    <div>
                      <p className="text-xs text-slate-400">상담 방식</p>
                      <div className="flex items-center justify-end gap-1 text-sm font-bold text-slate-700">
                        <MethodIcon className="h-3.5 w-3.5 text-blue-500" />
                        {concern.method}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">작성일</p>
                      <p className="text-sm font-black text-slate-700">{formatDateLabel(concern.createdAt)}</p>
                    </div>
                  </div>

                  {/* 상태 + 버튼 */}
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="text-xs text-slate-400">상태</p>
                    <span className={cn("flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold", status.tone, status.border)}>
                      <StatusIcon className="h-3 w-3" />
                      {concern.status}
                    </span>
                    <Button
                      className="h-9 rounded-xl bg-blue-600 px-4 text-sm font-black hover:bg-blue-700"
                      onClick={() => handleRequestMatch(concern.id)}
                    >
                      {linkedThread ? "이어서 보기" : "요청하기"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 고민 현황 사이드바 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900">고민 현황</h3>
            <div className="mt-4 space-y-3">
              {[
                { label: "전체", count: totalConcerns, icon: List, color: "text-slate-600" },
                { label: "답변 대기", count: waitingConcerns, icon: Clock3, color: "text-blue-600" },
                { label: "상담중", count: inProgressConcerns, icon: MessageCircle, color: "text-green-600" },
                { label: "답변 완료", count: doneConcerns, icon: CheckCircle2, color: "text-blue-600" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Icon className={cn("h-4 w-4", item.color)} />
                      {item.label}
                    </div>
                    <span className="text-lg font-black text-slate-900">{item.count}건</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-center rounded-2xl bg-slate-50 py-6">
              <img src={`/step${currentLevel.level}.png`} alt="맵지리" className="h-32 w-32 object-contain" />
              <p className="mt-3 text-center text-sm font-black text-slate-700">
                레벨별 맵지리와 함께<br />고민을 나눠보세요!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 매칭 메시지함 탭 */}
      {activeTab === "messages" && (
        <div className="grid gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:grid-cols-[300px_1fr_280px]">
          {/* 스레드 목록 */}
          <div className="border-r border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <button className="flex items-center gap-1 text-sm font-bold text-slate-700">
                전체 {orderedThreads.length} <ChevronDown className="h-4 w-4" />
              </button>
              <button className="text-xs font-bold text-slate-400">안 읽은 순 <ChevronDown className="inline h-3 w-3" /></button>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {orderedThreads.map((thread) => {
                const tutor = TUTORS.find((t) => t.id === thread.tutorId);
                const concern = concerns.find((c) => c.id === thread.concernId);
                if (!tutor || !concern) return null;
                const isActive = selectedThread?.id === thread.id;
                const lastMsg = thread.messages[thread.messages.length - 1];
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => { setSelectedThreadId(thread.id); setActiveTab("messages"); }}
                    className={cn("flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition-colors", isActive ? "bg-blue-50" : "hover:bg-slate-50")}
                  >
                    <TutorAvatar tutor={tutor} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-slate-900">{tutor.name}</span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold",
                            thread.stage === "매칭 요청" ? "bg-blue-50 text-blue-600" :
                            thread.stage === "상담중" ? "bg-green-50 text-green-600" :
                            "bg-violet-50 text-violet-600"
                          )}>
                            {thread.stage}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{formatRelativeTime(thread.lastUpdatedAt)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{lastMsg?.text}</p>
                    </div>
                    {thread.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                        {thread.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
              <button className="w-full py-4 text-center text-sm font-bold text-slate-500 hover:text-blue-600">
                더 불러오기 <ChevronDown className="inline h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 채팅 영역 */}
          {selectedThread && selectedConcern && selectedTutor ? (
            <>
              <div className="flex flex-col border-r border-slate-100">
                {/* 채팅 헤더 */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900">{selectedTutor.name}</span>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold",
                      selectedThread.stage === "매칭 요청" ? "bg-blue-50 text-blue-600" :
                      selectedThread.stage === "상담중" ? "bg-green-50 text-green-600" :
                      "bg-violet-50 text-violet-600"
                    )}>
                      {selectedThread.stage}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="h-5 w-5" /></button>
                </div>

                {/* 튜터 정보 바 */}
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
                  <span className="text-sm text-slate-500">{selectedTutor.school} · {selectedTutor.major} · {selectedTutor.year}</span>
                  <div className="flex gap-1">
                    {selectedTutor.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">{tag}</span>
                    ))}
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs text-slate-500">
                    <img src={`/step${selectedTutor.level}.png`} alt="" className="h-5 w-5 object-contain" />
                    Lv.{selectedTutor.level} {getLevelMeta(selectedTutor.level).name}
                  </span>
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 space-y-4 overflow-y-auto bg-white px-5 py-5" style={{ minHeight: 360, maxHeight: 440 }}>
                  <div className="text-center text-xs font-bold text-slate-400">
                    {new Date(selectedThread.messages[0]?.createdAt ?? Date.now()).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
                  </div>
                  {selectedThread.messages.map((msg) => {
                    const isUser = msg.sender === "user";
                    const isSystem = msg.sender === "system";
                    if (isSystem) return (
                      <div key={msg.id} className="flex justify-center">
                        <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-bold text-slate-500">{msg.text}</span>
                      </div>
                    );
                    return (
                      <div key={msg.id} className={cn("flex gap-2", isUser ? "justify-end" : "justify-start")}>
                        {!isUser && <TutorAvatar tutor={selectedTutor} size="sm" />}
                        <div className={cn("max-w-[70%]", isUser ? "items-end" : "items-start")}>
                          <div className={cn("mb-1 text-xs text-slate-400", isUser ? "text-right" : "text-left")}>
                            {!isUser && <span className="mr-1 font-black text-slate-700">{selectedTutor.name}</span>}
                            {formatTimeLabel(msg.createdAt)}
                          </div>
                          <div className={cn("rounded-2xl px-4 py-3 text-sm font-medium leading-6 shadow-sm",
                            isUser ? "rounded-br-sm bg-blue-600 text-white" : "rounded-bl-sm bg-slate-100 text-slate-800"
                          )}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* 입력창 */}
                <div className="border-t border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2">
                    <Input
                      value={messageDraft}
                      onChange={(e) => setMessageDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      disabled={selectedThread.stage === "답변 완료"}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                    />
                    <button className="text-slate-400 hover:text-slate-600"><Smile className="h-5 w-5" /></button>
                    <button className="rounded-lg border border-dashed border-slate-300 p-1 text-slate-400 hover:text-blue-500"><Phone className="h-4 w-4" /></button>
                    <button className="text-slate-400 hover:text-slate-600"><Paperclip className="h-5 w-5" /></button>
                    <Button className="h-8 bg-blue-600 px-4 text-sm font-bold hover:bg-blue-700" onClick={handleSendMessage} disabled={selectedThread.stage === "답변 완료"}>
                      <Send className="h-3.5 w-3.5" />
                      전송
                    </Button>
                  </div>
                </div>
              </div>

              {/* 상담 정보 사이드바 */}
              <div className="space-y-4 overflow-y-auto p-5">
                <h3 className="text-lg font-black text-slate-900">상담 정보</h3>

                <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">회망 상담 시간</span>
                    <span className="font-black text-slate-900">{selectedThread.selectedMinutes}분</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">튜터 등급</span>
                    <span className="flex items-center gap-1 font-black text-slate-900">
                      <img src={`/step${selectedTutor.level}.png`} alt="" className="h-5 w-5 object-contain" />
                      Lv.{selectedTutor.level} {getLevelMeta(selectedTutor.level).name}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">시간 환산</span>
                    <span className="font-black text-slate-900">10분 = {selectedTutor.level} 코인</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-500">계산 방식</span>
                    <span className="font-black text-slate-900">{selectedThread.selectedMinutes}분 ÷ 10분 × {selectedTutor.level} (Lv.{selectedTutor.level})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-white p-4">
                  <span className="text-sm font-black text-slate-700">총 지급 코인</span>
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <span className="text-2xl font-black text-blue-600">{selectedCost}</span>
                    <span className="text-base font-bold text-slate-500">코인</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400">지급 코인은 튜터에게 전달되며, 상담 완료 후 사용 확정됩니다.</p>

                <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
                  <p className="text-xs font-black text-yellow-700">💡 코인 계산 방식</p>
                  <p className="mt-2 text-xs text-slate-600">상담 시간(분) ÷ 10 × 튜터 레벨 = 지급 코인</p>
                  <p className="mt-1 text-xs text-slate-500">예시)</p>
                  <p className="text-xs text-slate-500">· 20분, Lv.1 뚜벅이 → 20 코인</p>
                  <p className="text-xs text-slate-500">· 30분, Lv.2 씽씽이 → 60 코인</p>
                  <p className="text-xs text-slate-500">· 45분, Lv.3 따릉이 → 135 코인</p>
                </div>

                {paymentError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                    <AlertCircle className="h-3.5 w-3.5" /> {paymentError}
                  </div>
                )}

                <div className="space-y-2">
                  {!selectedThread.paymentConfirmed && (
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 text-sm font-bold" onClick={handleCancelRequest}>
                      거절하기
                    </Button>
                  )}
                  <Button
                    className="w-full rounded-xl bg-blue-600 text-sm font-black hover:bg-blue-700 disabled:bg-slate-300"
                    onClick={handleConfirmPayment}
                    disabled={selectedThread.paymentConfirmed || selectedThread.stage === "답변 완료"}
                  >
                    {selectedThread.paymentConfirmed ? "상담 확정 완료" : "매칭 수락하고 결제하기"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-2 flex flex-col items-center justify-center gap-4 p-10 text-center">
              <img src={`/step${currentLevel.level}.png`} alt="맵지리" className="h-24 w-24 object-contain" />
              <p className="text-lg font-black text-slate-700">아직 생성된 매칭이 없어요</p>
              <p className="text-sm text-slate-400">고민 목록에서 요청하기를 눌러보세요.</p>
              <Button onClick={() => setActiveTab("list")}>고민 목록으로 이동</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
