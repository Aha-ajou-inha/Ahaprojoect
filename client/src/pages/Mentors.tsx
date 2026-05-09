import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Coins,
  List,
  MapPin,
  MessageCircle,
  PencilLine,
  PhoneCall,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getConsultCoinCost, getGrowthLevel, growthLevels, Mapjiri, TransportIcon } from "@/lib/roadin";

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
  level: number;
  tags: string[];
  focus: ConsultingField[];
  intro: string;
  avatarTone: string;
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

type NoticeState = {
  tone: "success" | "info" | "error";
  message: string;
};

type AnalysisCard = {
  keywords: string[];
  insight: string;
  suggestedTutor: Tutor;
  suggestedMethod: ConsultingMethod;
};

const ROADIN_USER = {
  name: "김맵지",
  startingCoins: 750,
};

const COUNSEL_FIELDS: ConsultingField[] = ["취업", "진로/커리어", "스펙/자격증", "대학생활", "기타"];
const TIME_OPTIONS = [10, 20, 30, 40, 50, 60];
const EMPTY_DRAFT: ConcernDraft = {
  title: "",
  content: "",
  fields: ["진로/커리어"],
  method: "채팅",
};

const STORAGE_KEYS = {
  concerns: "roadin-consult-concerns-v2",
  threads: "roadin-consult-threads-v2",
  draft: "roadin-consult-draft-v2",
  coins: "roadin-consult-coins-v2",
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const METHOD_META: Record<
  ConsultingMethod,
  { icon: LucideIcon; label: string; helper: string; tone: string }
> = {
  채팅: {
    icon: MessageCircle,
    label: "채팅",
    helper: "가볍게 시작하고 빠르게 이어가요.",
    tone: "border-blue-200 bg-blue-50 text-blue-700",
  },
  "음성 통화": {
    icon: PhoneCall,
    label: "음성 통화",
    helper: "질문을 묶어서 깊이 있게 정리해요.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  "대면 상담": {
    icon: Users,
    label: "대면 상담",
    helper: "자료를 같이 보며 세부 피드백을 받아요.",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
};

const STATUS_META: Record<
  ConcernStatus,
  { icon: LucideIcon; tone: string; description: string }
> = {
  "답변 대기": {
    icon: Clock3,
    tone: "border-blue-200 bg-blue-50 text-blue-700",
    description: "멘토 매칭을 기다리고 있어요.",
  },
  상담중: {
    icon: MessageCircle,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    description: "멘토와 상담 흐름이 진행 중이에요.",
  },
  "답변 완료": {
    icon: CheckCircle2,
    tone: "border-violet-200 bg-violet-50 text-violet-700",
    description: "상담이 마무리되어 기록만 남았어요.",
  },
};

const TUTORS: Tutor[] = [
  {
    id: "tutor-jiyu",
    name: "박지우 튜터",
    school: "연세대학교",
    major: "경영학과",
    level: 1,
    tags: ["데이터 분석", "마케팅"],
    focus: ["진로/커리어", "기타"],
    intro: "막막한 고민을 작게 쪼개서 다음 액션으로 연결해드릴게요.",
    avatarTone: "from-slate-100 via-white to-slate-200",
    avatarText: "박",
  },
  {
    id: "tutor-jiwon",
    name: "이지원 튜터",
    school: "성균관대학교",
    major: "교육학과",
    level: 2,
    tags: ["대학생활", "시간 관리"],
    focus: ["대학생활", "기타"],
    intro: "학교생활과 대외활동을 병행하는 루틴 설계를 도와드려요.",
    avatarTone: "from-sky-100 via-white to-cyan-100",
    avatarText: "이",
  },
  {
    id: "tutor-minho",
    name: "최민호 튜터",
    school: "한양대학교",
    major: "컴퓨터공학과",
    level: 3,
    tags: ["취업", "포트폴리오"],
    focus: ["취업", "스펙/자격증"],
    intro: "포트폴리오와 프로젝트 경험을 취업 언어로 번역해드릴게요.",
    avatarTone: "from-emerald-100 via-white to-lime-100",
    avatarText: "최",
  },
  {
    id: "tutor-seoyeon",
    name: "박서연 튜터",
    school: "중앙대학교",
    major: "산업디자인학과",
    level: 4,
    tags: ["AI 기획", "프로젝트"],
    focus: ["진로/커리어", "기타"],
    intro: "아이디어를 실제 프로젝트 주제로 바꾸는 흐름을 함께 잡아드려요.",
    avatarTone: "from-amber-100 via-white to-orange-100",
    avatarText: "서",
  },
  {
    id: "tutor-haneul",
    name: "윤하늘 튜터",
    school: "고려대학교",
    major: "심리학과",
    level: 5,
    tags: ["커리어 로드맵", "장기 전략"],
    focus: ["취업", "진로/커리어"],
    intro: "당장 필요한 답과 장기적인 방향을 함께 설계해드릴게요.",
    avatarTone: "from-violet-100 via-white to-fuchsia-100",
    avatarText: "윤",
  },
];

function buildSummary(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= 68) {
    return normalized;
  }

  return `${normalized.slice(0, 68).trim()}...`;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readStored<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getLevelMeta(level: number) {
  return growthLevels.find((item) => item.level === level) ?? growthLevels[0];
}

function pickTutor(fields: ConsultingField[]) {
  const primary = fields[0] ?? "기타";

  if (primary === "취업") {
    return TUTORS[2];
  }

  if (primary === "스펙/자격증") {
    return TUTORS[2];
  }

  if (primary === "대학생활") {
    return TUTORS[1];
  }

  if (primary === "진로/커리어") {
    return TUTORS[4];
  }

  return TUTORS[3];
}

function analyzeConcern(
  title: string,
  content: string,
  fields: ConsultingField[],
  method: ConsultingMethod,
): AnalysisCard {
  const text = `${title} ${content}`.toLowerCase();
  const keywords = [...fields];

  const keywordMap = [
    { token: "면접", label: "면접 준비" },
    { token: "포트폴리오", label: "포트폴리오" },
    { token: "자격증", label: "자격증 전략" },
    { token: "프로젝트", label: "프로젝트 경험" },
    { token: "시간", label: "시간 관리" },
    { token: "로드맵", label: "로드맵 설계" },
    { token: "대외활동", label: "대외활동" },
    { token: "ai", label: "AI 프로젝트" },
    { token: "취업", label: "취업 준비" },
    { token: "진로", label: "진로 탐색" },
  ];

  keywordMap.forEach((entry) => {
    if (text.includes(entry.token)) {
      keywords.push(entry.label as ConsultingField);
    }
  });

  const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 4);
  const suggestedTutor = pickTutor(fields);

  const primaryField = fields[0] ?? "기타";
  const insightMap: Record<ConsultingField, string> = {
    취업: "취업 고민은 준비 순서를 정리하는 것만으로도 체감 부담이 크게 줄어들어요.",
    "진로/커리어": "진로 고민은 잘하는 것보다 오래 해보고 싶은 방향을 먼저 좁히면 훨씬 수월해져요.",
    "스펙/자격증": "스펙 고민은 많이 하는 것보다 목표 직무와 연결되는 한두 가지를 선명하게 만드는 게 중요해요.",
    대학생활: "대학생활 고민은 일정 관리와 우선순위만 정리해도 바로 실행할 수 있는 답이 나오는 편이에요.",
    기타: "고민을 구체적인 상황과 질문으로 바꾸면 상담 효율이 훨씬 좋아져요.",
  };

  return {
    keywords: uniqueKeywords.length > 0 ? uniqueKeywords : ["고민 정리", "상담 설계"],
    insight: insightMap[primaryField],
    suggestedTutor,
    suggestedMethod: method,
  };
}

function createSeedConcerns() {
  const now = Date.now();

  return [
    {
      id: "concern-1",
      title: "진로 방향을 어떻게 잡아야 할지 고민이에요",
      content: "법무학과 수업을 듣고 있는데 어떤 분야를 더 깊게 준비해야 할지 막막해요.",
      summary: "법무학과 수업을 듣고 있는데 어떤 분야를 더 깊게 준비해야 할지 막막해요.",
      fields: ["진로/커리어", "대학생활"],
      method: "채팅",
      status: "답변 대기",
      level: 1,
      createdAt: now - DAY_MS * 8,
    },
    {
      id: "concern-2",
      title: "학교생활과 프로젝트를 병행하는 방법이 궁금해요",
      content: "수업, 팀플, 대외활동을 함께 하려니 시간 관리가 너무 어려워요.",
      summary: "수업, 팀플, 대외활동을 함께 하려니 시간 관리가 너무 어려워요.",
      fields: ["대학생활", "기타"],
      method: "채팅",
      status: "상담중",
      level: 2,
      createdAt: now - DAY_MS * 6,
      threadId: "thread-2",
    },
    {
      id: "concern-3",
      title: "포트폴리오에 어떤 프로젝트를 넣어야 할까요?",
      content: "AI 분야를 희망하는데 어떤 결과물이 취업 준비에 도움이 될지 잘 모르겠어요.",
      summary: "AI 분야를 희망하는데 어떤 결과물이 취업 준비에 도움이 될지 잘 모르겠어요.",
      fields: ["스펙/자격증", "취업"],
      method: "음성 통화",
      status: "답변 완료",
      level: 3,
      createdAt: now - DAY_MS * 5,
      threadId: "thread-3",
    },
    {
      id: "concern-4",
      title: "AI 프로젝트 주제 추천을 받고 싶어요",
      content: "인공지능에 관심이 있어서 인턴 준비용 프로젝트를 만들고 싶은데 주제를 못 정했어요.",
      summary: "인공지능에 관심이 있어서 인턴 준비용 프로젝트를 만들고 싶은데 주제를 못 정했어요.",
      fields: ["기타", "진로/커리어"],
      method: "채팅",
      status: "상담중",
      level: 4,
      createdAt: now - DAY_MS * 4,
      threadId: "thread-4",
    },
  ] satisfies Concern[];
}

function createSeedThreads() {
  const now = Date.now();

  return [
    {
      id: "thread-2",
      concernId: "concern-2",
      tutorId: "tutor-jiwon",
      stage: "상담중",
      selectedMinutes: 20,
      paymentConfirmed: true,
      unreadCount: 0,
      lastUpdatedAt: now - HOUR_MS * 2,
      messages: [
        {
          id: "message-21",
          sender: "system",
          text: "이지원 튜터와의 상담이 확정되었어요. 시간 관리 루틴을 함께 정리해보세요.",
          createdAt: now - HOUR_MS * 5,
        },
        {
          id: "message-22",
          sender: "tutor",
          text: "수업이 몰리는 요일과 프로젝트 마감일을 먼저 구분하면 일정이 훨씬 가벼워져요.",
          createdAt: now - HOUR_MS * 3,
        },
        {
          id: "message-23",
          sender: "user",
          text: "주중에는 과제가 몰리고 주말에 프로젝트를 몰아서 하는 편인데 이 방식이 맞는지 궁금해요.",
          createdAt: now - HOUR_MS * 2,
        },
      ],
    },
    {
      id: "thread-3",
      concernId: "concern-3",
      tutorId: "tutor-minho",
      stage: "답변 완료",
      selectedMinutes: 30,
      paymentConfirmed: true,
      unreadCount: 0,
      lastUpdatedAt: now - DAY_MS,
      messages: [
        {
          id: "message-31",
          sender: "system",
          text: "최민호 튜터와 30분 음성 상담이 완료되었어요.",
          createdAt: now - DAY_MS * 2,
        },
        {
          id: "message-32",
          sender: "tutor",
          text: "포트폴리오에는 기술만 나열하기보다 해결한 문제와 결과 지표를 함께 적는 편이 좋아요.",
          createdAt: now - DAY_MS * 2 + HOUR_MS,
        },
        {
          id: "message-33",
          sender: "user",
          text: "그럼 학부 프로젝트도 문제 정의와 개선 결과를 중심으로 묶어보겠습니다. 감사합니다!",
          createdAt: now - DAY_MS,
        },
      ],
    },
    {
      id: "thread-4",
      concernId: "concern-4",
      tutorId: "tutor-seoyeon",
      stage: "매칭 요청",
      selectedMinutes: 20,
      paymentConfirmed: false,
      unreadCount: 1,
      lastUpdatedAt: now - 32 * MINUTE_MS,
      messages: [
        {
          id: "message-41",
          sender: "system",
          text: "박서연 튜터에게 매칭을 요청했어요. 희망 시간을 정하면 바로 상담을 확정할 수 있어요.",
          createdAt: now - 45 * MINUTE_MS,
        },
        {
          id: "message-42",
          sender: "tutor",
          text: "안녕하세요! AI 프로젝트 주제 고민을 읽어봤어요. 관심 산업과 만들고 싶은 결과물이 있다면 더 구체적으로 같이 정리해볼게요.",
          createdAt: now - 32 * MINUTE_MS,
        },
      ],
    },
  ] satisfies MatchThread[];
}

function formatDateLabel(timestamp: number) {
  const date = new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

function formatTimeLabel(timestamp: number) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;

  if (diff < HOUR_MS) {
    return `${Math.max(1, Math.round(diff / MINUTE_MS))}분 전`;
  }

  if (diff < DAY_MS) {
    return `${Math.max(1, Math.round(diff / HOUR_MS))}시간 전`;
  }

  return `${Math.max(1, Math.round(diff / DAY_MS))}일 전`;
}

function createTutorReply(
  concern: Concern,
  tutor: Tutor,
  minutes: number,
  mode: "request" | "followup" | "payment",
) {
  const primaryField = concern.fields[0] ?? "기타";

  if (mode === "request") {
    return `안녕하세요! ${concern.title} 고민을 읽어봤어요. ${primaryField} 관점에서 같이 정리해보면 금방 방향이 잡힐 것 같아요.`;
  }

  if (mode === "payment") {
    return `좋아요. ${minutes}분 안에 가장 중요한 질문부터 우선순위대로 짚어볼게요. 궁금한 자료가 있다면 채팅으로 먼저 남겨주세요.`;
  }

  if (primaryField === "취업") {
    return "취업 고민은 한 번에 다 해결하려 하기보다 준비 순서를 나누는 게 좋아요. 지금 가장 급한 항목부터 같이 골라볼까요?";
  }

  if (primaryField === "스펙/자격증") {
    return "스펙 고민은 목표 직무와 연결되는 경험만 선명하게 남기는 게 핵심이에요. 필요 없는 항목은 과감히 덜어내도 괜찮아요.";
  }

  if (primaryField === "대학생활") {
    return "시간표, 팀플, 대외활동을 한 주 기준으로 다시 배치해보면 생각보다 숨통이 트여요. 지금 제일 지치는 구간을 먼저 알려주세요.";
  }

  if (primaryField === "진로/커리어") {
    return `${tutor.name} 기준으로 보면 진로 고민은 정답 찾기보다 후보를 좁히는 과정이 더 중요해요. 관심 있는 방향 두세 개만 먼저 적어봐도 좋아요.`;
  }

  return "고민이 아직 넓게 잡혀 있어서, 하고 싶은 일과 피하고 싶은 일을 한 줄씩만 적어보면 훨씬 구체적인 답을 드릴 수 있어요.";
}

function TutorAvatar({ tutor, className = "h-12 w-12" }: { tutor: Tutor; className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-white shadow-sm bg-gradient-to-br text-base font-black text-slate-700",
        tutor.avatarTone,
        className,
      )}
      aria-label={tutor.name}
    >
      {tutor.avatarText}
    </div>
  );
}

export function Mentors() {
  const [activeTab, setActiveTab] = useState<ConsultTab>("write");
  const [draft, setDraft] = useState<ConcernDraft>(() => readStored(STORAGE_KEYS.draft, EMPTY_DRAFT));
  const [concerns, setConcerns] = useState<Concern[]>(() => readStored(STORAGE_KEYS.concerns, createSeedConcerns()));
  const [threads, setThreads] = useState<MatchThread[]>(() => readStored(STORAGE_KEYS.threads, createSeedThreads()));
  const [coinBalance, setCoinBalance] = useState<number>(() => readStored(STORAGE_KEYS.coins, ROADIN_USER.startingCoins));
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [formError, setFormError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const replyTimeoutsRef = useRef<number[]>([]);
  const activeTabRef = useRef<ConsultTab>("write");
  const selectedThreadRef = useRef<string | null>(null);

  const currentLevel = getGrowthLevel(coinBalance);
  const analysis = analyzeConcern(draft.title, draft.content, draft.fields, draft.method);
  const orderedConcerns = [...concerns].sort((a, b) => b.createdAt - a.createdAt);
  const orderedThreads = [...threads].sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt);
  const selectedThread = orderedThreads.find((thread) => thread.id === selectedThreadId) ?? orderedThreads[0] ?? null;
  const selectedConcern = concerns.find((concern) => concern.id === selectedThread?.concernId) ?? null;
  const selectedTutor = TUTORS.find((tutor) => tutor.id === selectedThread?.tutorId) ?? null;
  const selectedCost = selectedThread && selectedTutor
    ? getConsultCoinCost(selectedThread.selectedMinutes, selectedTutor.level)
    : 0;
  const totalConcerns = concerns.length;
  const waitingConcerns = concerns.filter((concern) => concern.status === "답변 대기").length;
  const inProgressConcerns = concerns.filter((concern) => concern.status === "상담중").length;
  const doneConcerns = concerns.filter((concern) => concern.status === "답변 완료").length;

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    selectedThreadRef.current = selectedThreadId;
  }, [selectedThreadId]);

  useEffect(() => {
    if (!selectedThreadId && orderedThreads.length > 0) {
      setSelectedThreadId(orderedThreads[0].id);
      return;
    }

    if (selectedThreadId && !threads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(orderedThreads[0]?.id ?? null);
    }
  }, [orderedThreads, selectedThreadId, threads]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.concerns, JSON.stringify(concerns));
  }, [concerns]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.threads, JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.coins, JSON.stringify(coinBalance));
  }, [coinBalance]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    return () => {
      replyTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "messages" || !selectedThreadId) {
      return;
    }

    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.id === selectedThreadId && thread.unreadCount > 0
          ? { ...thread, unreadCount: 0 }
          : thread,
      ),
    );
  }, [activeTab, selectedThreadId]);

  useEffect(() => {
    setPaymentError("");
  }, [selectedThreadId]);

  function updateThread(threadId: string, updater: (thread: MatchThread) => MatchThread) {
    setThreads((prevThreads) =>
      prevThreads.map((thread) => (thread.id === threadId ? updater(thread) : thread)),
    );
  }

  function queueTutorReply(threadId: string, concern: Concern, tutor: Tutor, mode: "request" | "followup" | "payment") {
    const timeoutId = window.setTimeout(() => {
      const nextMessage: Message = {
        id: createId("message"),
        sender: "tutor",
        text: createTutorReply(
          concern,
          tutor,
          threads.find((thread) => thread.id === threadId)?.selectedMinutes ?? 20,
          mode,
        ),
        createdAt: Date.now(),
      };

      setThreads((prevThreads) =>
        prevThreads.map((thread) => {
          if (thread.id !== threadId) {
            return thread;
          }

          const isFocused = activeTabRef.current === "messages" && selectedThreadRef.current === threadId;
          return {
            ...thread,
            messages: [...thread.messages, nextMessage],
            lastUpdatedAt: nextMessage.createdAt,
            unreadCount: isFocused ? 0 : thread.unreadCount + 1,
          };
        }),
      );
    }, mode === "followup" ? 1300 : 900);

    replyTimeoutsRef.current.push(timeoutId);
  }

  function handleToggleField(field: ConsultingField) {
    setDraft((prevDraft) => {
      const alreadySelected = prevDraft.fields.includes(field);

      return {
        ...prevDraft,
        fields: alreadySelected
          ? prevDraft.fields.filter((item) => item !== field)
          : [...prevDraft.fields, field],
      };
    });
  }

  function handleSaveConcern() {
    const trimmedTitle = draft.title.trim();
    const trimmedContent = draft.content.trim();

    if (!trimmedTitle || !trimmedContent || draft.fields.length === 0) {
      setFormError("제목, 고민 내용, 상담 분야를 모두 입력해주세요.");
      return;
    }

    const nextConcern: Concern = {
      id: createId("concern"),
      title: trimmedTitle,
      content: trimmedContent,
      summary: buildSummary(trimmedContent),
      fields: draft.fields,
      method: draft.method,
      status: "답변 대기",
      level: currentLevel.level,
      createdAt: Date.now(),
    };

    setConcerns((prevConcerns) => [nextConcern, ...prevConcerns]);
    setDraft(EMPTY_DRAFT);
    setFormError("");
    setActiveTab("list");
    setNotice({
      tone: "success",
      message: "고민이 저장되었어요. 목록에서 바로 매칭을 요청해보세요.",
    });
  }

  function handleRequestMatch(concernId: string) {
    const targetConcern = concerns.find((concern) => concern.id === concernId);
    if (!targetConcern) {
      return;
    }

    const existingThread = threads.find((thread) => thread.concernId === concernId);
    if (existingThread) {
      setSelectedThreadId(existingThread.id);
      setActiveTab("messages");
      setNotice({
        tone: "info",
        message: "이미 연결된 메시지함으로 이동했어요.",
      });
      return;
    }

    const tutor = pickTutor(targetConcern.fields);
    const requestedAt = Date.now();
    const systemMessage: Message = {
      id: createId("message"),
      sender: "system",
      text: `${tutor.name}에게 매칭을 요청했어요. 희망 상담 시간을 고르면 바로 상담을 확정할 수 있어요.`,
      createdAt: requestedAt,
    };

    const nextThread: MatchThread = {
      id: createId("thread"),
      concernId: targetConcern.id,
      tutorId: tutor.id,
      stage: "매칭 요청",
      selectedMinutes: 20,
      paymentConfirmed: false,
      unreadCount: 0,
      lastUpdatedAt: requestedAt,
      messages: [systemMessage],
    };

    setThreads((prevThreads) => [nextThread, ...prevThreads]);
    setConcerns((prevConcerns) =>
      prevConcerns.map((concern) =>
        concern.id === targetConcern.id
          ? { ...concern, status: "상담중", threadId: nextThread.id }
          : concern,
      ),
    );
    setSelectedThreadId(nextThread.id);
    setActiveTab("messages");
    setNotice({
      tone: "success",
      message: `${tutor.name}와의 매칭이 생성되었어요. 메시지함에서 이어서 진행해보세요.`,
    });
    queueTutorReply(nextThread.id, targetConcern, tutor, "request");
  }

  function handleSendMessage() {
    if (!selectedThread || !selectedConcern || !selectedTutor) {
      return;
    }

    const trimmed = messageDraft.trim();
    if (!trimmed || selectedThread.stage === "답변 완료") {
      return;
    }

    const nextMessage: Message = {
      id: createId("message"),
      sender: "user",
      text: trimmed,
      createdAt: Date.now(),
    };

    updateThread(selectedThread.id, (thread) => ({
      ...thread,
      messages: [...thread.messages, nextMessage],
      lastUpdatedAt: nextMessage.createdAt,
      unreadCount: 0,
    }));
    setMessageDraft("");
    queueTutorReply(selectedThread.id, selectedConcern, selectedTutor, "followup");
  }

  function handleSelectMinutes(minutes: number) {
    if (!selectedThread) {
      return;
    }

    updateThread(selectedThread.id, (thread) => ({
      ...thread,
      selectedMinutes: minutes,
    }));
    setPaymentError("");
  }

  function handleConfirmPayment() {
    if (!selectedThread || !selectedTutor || !selectedConcern) {
      return;
    }

    if (selectedThread.paymentConfirmed) {
      setNotice({
        tone: "info",
        message: "이미 상담이 확정된 매칭이에요.",
      });
      return;
    }

    const cost = getConsultCoinCost(selectedThread.selectedMinutes, selectedTutor.level);
    if (coinBalance < cost) {
      setPaymentError("코인이 부족합니다");
      return;
    }

    const confirmedAt = Date.now();
    const paymentMessage: Message = {
      id: createId("message"),
      sender: "system",
      text: `${cost}코인이 차감되었고 ${selectedThread.selectedMinutes}분 상담이 확정되었어요.`,
      createdAt: confirmedAt,
    };

    setCoinBalance((prevCoins) => prevCoins - cost);
    updateThread(selectedThread.id, (thread) => ({
      ...thread,
      stage: "상담중",
      paymentConfirmed: true,
      messages: [...thread.messages, paymentMessage],
      lastUpdatedAt: confirmedAt,
    }));
    setConcerns((prevConcerns) =>
      prevConcerns.map((concern) =>
        concern.id === selectedConcern.id
          ? { ...concern, status: "상담중" }
          : concern,
      ),
    );
    setPaymentError("");
    setNotice({
      tone: "success",
      message: `${cost}코인이 차감되고 상담이 확정되었어요.`,
    });
    queueTutorReply(selectedThread.id, selectedConcern, selectedTutor, "payment");
  }

  function handleCancelRequest() {
    if (!selectedThread || !selectedConcern || selectedThread.paymentConfirmed) {
      return;
    }

    setThreads((prevThreads) => prevThreads.filter((thread) => thread.id !== selectedThread.id));
    setConcerns((prevConcerns) =>
      prevConcerns.map((concern) =>
        concern.id === selectedConcern.id
          ? { ...concern, status: "답변 대기", threadId: undefined }
          : concern,
      ),
    );
    setSelectedThreadId(null);
    setActiveTab("list");
    setNotice({
      tone: "info",
      message: "매칭 요청을 취소했어요. 고민 목록에서 다시 요청할 수 있어요.",
    });
  }

  function handleCompleteConsult() {
    if (!selectedThread || !selectedConcern) {
      return;
    }

    const completedAt = Date.now();
    const systemMessage: Message = {
      id: createId("message"),
      sender: "system",
      text: "상담이 답변 완료 상태로 기록되었어요. 다음 고민이 생기면 다시 Road-In 상담을 이용해보세요.",
      createdAt: completedAt,
    };

    updateThread(selectedThread.id, (thread) => ({
      ...thread,
      stage: "답변 완료",
      messages: [...thread.messages, systemMessage],
      lastUpdatedAt: completedAt,
    }));
    setConcerns((prevConcerns) =>
      prevConcerns.map((concern) =>
        concern.id === selectedConcern.id
          ? { ...concern, status: "답변 완료" }
          : concern,
      ),
    );
    setNotice({
      tone: "success",
      message: "상담이 답변 완료로 정리되었어요.",
    });
  }

  return (
    <div className="space-y-7 pb-10">
      <section className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
        <div className="grid lg:min-h-[300px] lg:grid-cols-[0.94fr_1.26fr]">
          <div className="relative z-10 flex min-h-[250px] flex-col justify-between gap-6 px-6 py-6 sm:px-8 lg:min-h-[300px]">
            <div>
              <Badge className="mb-3 bg-blue-50 text-blue-700 hover:bg-blue-50">
                map-based campus counseling route
              </Badge>
              <h1 className="text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                Road-In 상담
              </h1>
              <p className="mt-3 max-w-lg text-sm font-bold leading-6 text-slate-500 sm:text-base">
                진로, 취업, 포트폴리오, 대학생활 고민을 Road-In 안에서 정리하고
                멘토와 바로 연결해보세요. 저장부터 매칭, 메시지, 코인 결제까지
                한 화면에서 이어집니다.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">
                  전체 고민 {totalConcerns}개
                </div>
                <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-black text-blue-700">
                  진행 중 상담 {inProgressConcerns}건
                </div>
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
                  보유 코인 {coinBalance}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                className="h-10 bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
                onClick={() => setActiveTab("write")}
              >
                고민 작성하기
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 border-blue-200 bg-white px-4 text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              >
                <Link to="/ai-matching">
                  AI 추천 보기
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[260px] overflow-hidden border-t border-blue-100 bg-slate-50 lg:border-l lg:border-t-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_26%,rgba(191,219,254,0.62),transparent_20%),radial-gradient(circle_at_79%_20%,rgba(147,197,253,0.48),transparent_18%),radial-gradient(circle_at_74%_78%,rgba(187,247,208,0.36),transparent_18%),radial-gradient(circle_at_25%_80%,rgba(254,240,138,0.24),transparent_16%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(28deg,transparent_0_21%,rgba(147,197,253,0.28)_22%,rgba(147,197,253,0.28)_23%,transparent_24%_100%),linear-gradient(146deg,transparent_0_34%,rgba(148,163,184,0.26)_35%,rgba(148,163,184,0.26)_36%,transparent_37%_100%)]" />
            <div className="absolute inset-y-0 left-0 w-[42%] bg-[linear-gradient(90deg,rgba(248,250,252,1)_0%,rgba(248,250,252,0.92)_44%,rgba(248,250,252,0.18)_100%)]" />
            <div className="absolute left-[30%] top-[44%] hidden h-px w-[25%] rotate-[-12deg] bg-blue-300/80 sm:block" />
            <div className="absolute left-[52%] top-[42%] hidden h-px w-[20%] rotate-[15deg] bg-blue-300/80 sm:block" />
            <div className="absolute right-[14%] top-[31%] hidden h-px w-[14%] rotate-[-6deg] bg-emerald-300/80 sm:block" />

            <div className="absolute left-6 top-6 rounded-lg bg-white/88 px-3 py-2 shadow-sm backdrop-blur">
              <p className="text-xs font-black text-blue-600">현재 등급</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-black text-slate-900">
                <TransportIcon level={currentLevel.level} className="h-4 w-4 text-blue-600" />
                Lv.{currentLevel.level} {currentLevel.name}
              </div>
            </div>

            <div className="absolute right-6 top-6 rounded-lg bg-white/92 px-3 py-2 text-xs font-black text-slate-600 shadow-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                {coinBalance} 코인
              </div>
            </div>

            <div className="absolute left-[40%] top-[26%] hidden items-center gap-2 rounded-lg bg-white/88 px-3 py-2 text-xs font-black text-slate-600 shadow-sm sm:flex">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              상담 루트 연결 중
            </div>
            <div className="absolute bottom-7 right-6 flex items-end gap-5">
              <div className="hidden rounded-xl bg-white/92 px-4 py-3 text-sm font-bold text-slate-600 shadow-lg sm:block">
                <p className="text-xs font-black text-emerald-600">오늘의 상태</p>
                <p className="mt-1 max-w-[200px] leading-6">
                  고민 작성부터 메시지, 결제까지
                  <span className="text-blue-700"> Road-In </span>
                  안에서 바로 이어가요.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-x-0 bottom-0 h-6 rounded-full bg-blue-900/10 blur-md" />
                <Mapjiri level={currentLevel.level} className="relative h-36 w-36" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-blue-600">상담 플로우</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              고민작성에서 매칭 메시지함까지
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">
            <Coins className="h-4 w-4 text-amber-500" />
            {ROADIN_USER.name} · {coinBalance} 코인
          </div>
        </div>

        <div className="mt-5 grid gap-2 rounded-lg bg-slate-50 p-1 sm:grid-cols-3">
          {[
            { key: "write" as const, label: "고민작성", icon: PencilLine },
            { key: "list" as const, label: "고민 목록", icon: List },
            { key: "messages" as const, label: "매칭 메시지함", icon: MessageCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 rounded-lg text-sm font-black transition-colors",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-slate-950",
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {notice && (
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-bold",
              notice.tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
              notice.tone === "info" && "border-blue-200 bg-blue-50 text-blue-700",
              notice.tone === "error" && "border-red-200 bg-red-50 text-red-700",
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            {notice.message}
          </div>
        )}

        {activeTab === "write" && (
          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="border-blue-100 shadow-none">
              <CardContent className="space-y-6 p-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-950">고민 정보를 작성해주세요!</h3>
                  <p className="mt-2 text-sm font-bold text-slate-500">
                    고민을 구체적으로 적을수록 더 잘 맞는 멘토와 연결돼요.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-900">고민 제목</label>
                    <span className="text-xs font-bold text-slate-400">{draft.title.length}/50</span>
                  </div>
                  <Input
                    maxLength={50}
                    value={draft.title}
                    onChange={(event) =>
                      setDraft((prevDraft) => ({ ...prevDraft, title: event.target.value }))
                    }
                    placeholder="예) 포트폴리오에 어떤 프로젝트를 담아야 할까요?"
                    className="h-12 rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-900">고민 내용</label>
                    <span className="text-xs font-bold text-slate-400">{draft.content.length}/500</span>
                  </div>
                  <Textarea
                    maxLength={500}
                    value={draft.content}
                    onChange={(event) =>
                      setDraft((prevDraft) => ({ ...prevDraft, content: event.target.value }))
                    }
                    placeholder="현재 상황, 막히는 지점, 상담에서 얻고 싶은 답을 자세히 적어주세요."
                    className="min-h-[190px] rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-black text-slate-900">상담 분야</label>
                    <span className="text-xs font-bold text-slate-400">복수 선택 가능</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {COUNSEL_FIELDS.map((field) => {
                      const selected = draft.fields.includes(field);
                      return (
                        <button
                          key={field}
                          type="button"
                          onClick={() => handleToggleField(field)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-black transition-colors",
                            selected
                              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                              : "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100",
                          )}
                        >
                          {field}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-900">상담 방식</label>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(Object.keys(METHOD_META) as ConsultingMethod[]).map((method) => {
                      const meta = METHOD_META[method];
                      const Icon = meta.icon;
                      const selected = draft.method === method;
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() =>
                            setDraft((prevDraft) => ({ ...prevDraft, method }))
                          }
                          className={cn(
                            "rounded-xl border px-4 py-4 text-left transition-colors",
                            selected
                              ? meta.tone
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-100 hover:bg-slate-50",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="font-black">{meta.label}</span>
                          </div>
                          <p className="mt-2 text-xs font-bold text-slate-500">{meta.helper}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {formError}
                  </div>
                )}

                <Button
                  className="h-12 w-full bg-blue-600 text-base font-black hover:bg-blue-700"
                  onClick={handleSaveConcern}
                >
                  등록하기
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-blue-100 shadow-none">
              <CardContent className="relative h-full min-h-[520px] p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_36%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]" />
                <div className="absolute bottom-5 left-5 right-5 h-px bg-blue-100" />
                <div className="absolute left-5 top-24 h-2.5 w-2.5 rounded-full bg-blue-300" />
                <div className="absolute right-6 top-44 h-9 w-9 rounded-full border-2 border-blue-200/80" />
                <div className="absolute bottom-28 right-10 h-14 w-14 rounded-full border-2 border-dashed border-blue-200" />

                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">AI 고민 키워드 분석</h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                      입력한 내용을 바탕으로 핵심 키워드와 추천 튜터를 바로 정리해드려요.
                    </p>

                    <div className="mt-5">
                      <p className="text-xs font-black text-blue-600">핵심 키워드</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {analysis.keywords.map((keyword) => (
                          <Badge
                            key={keyword}
                            variant="secondary"
                            className="bg-white text-blue-700 hover:bg-white"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-white/90 bg-white/90 p-4 shadow-sm">
                      <p className="text-xs font-black text-blue-600">추천 튜터</p>
                      <div className="mt-3 flex items-center gap-3">
                        <TutorAvatar tutor={analysis.suggestedTutor} />
                        <div>
                          <p className="text-sm font-black text-slate-950">{analysis.suggestedTutor.name}</p>
                          <p className="text-xs font-bold text-slate-500">
                            Lv.{analysis.suggestedTutor.level} {getLevelMeta(analysis.suggestedTutor.level).name}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-bold leading-6 text-slate-600">
                        {analysis.suggestedTutor.intro}
                      </p>
                    </div>

                    <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                      <p className="text-xs font-black text-blue-600">AI 인사이트</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
                        {analysis.insight}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm font-black text-blue-700">
                        <MessageCircle className="h-4 w-4" />
                        추천 상담 방식: {analysis.suggestedMethod}
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-slate-500">현재 사용자 등급</p>
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-2 text-sm font-black text-slate-900 shadow-sm">
                        <TransportIcon level={currentLevel.level} className="h-4 w-4 text-blue-600" />
                        Lv.{currentLevel.level} {currentLevel.name}
                      </div>
                    </div>
                    <Mapjiri level={currentLevel.level} className="h-24 w-24 shrink-0" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "list" && (
          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
            <div className="space-y-3">
              {orderedConcerns.map((concern) => {
                const method = METHOD_META[concern.method];
                const status = STATUS_META[concern.status];
                const LevelTransport = status.icon;
                const levelMeta = getLevelMeta(concern.level);
                const linkedThread = threads.find((thread) => thread.concernId === concern.id);

                return (
                  <Card
                    key={concern.id}
                    className="overflow-hidden border-slate-200 shadow-none transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-sm"
                  >
                    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="w-[108px] shrink-0 rounded-2xl bg-slate-50 p-3 text-center">
                          <Mapjiri level={concern.level} className="mx-auto h-16 w-16" />
                          <Badge className={`mt-3 ${levelMeta.tone}`}>
                            Lv.{concern.level} {levelMeta.name}
                          </Badge>
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-xl font-black text-slate-950">{concern.title}</h3>
                          <p className="mt-2 line-clamp-2 text-sm font-bold leading-6 text-slate-500">
                            {concern.summary}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {concern.fields.map((field) => (
                              <Badge
                                key={field}
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                              >
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid shrink-0 gap-3 sm:min-w-[188px]">
                        <div>
                          <p className="text-xs font-black text-slate-400">상담 방식</p>
                          <div className="mt-1 flex items-center gap-2 text-sm font-black text-slate-800">
                            <method.icon className="h-4 w-4 text-blue-600" />
                            {concern.method}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400">상태</p>
                          <Badge className={cn("mt-1 border", status.tone)}>
                            <LevelTransport className="mr-1 h-3.5 w-3.5" />
                            {concern.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-400">작성일</p>
                          <p className="mt-1 text-sm font-black text-slate-800">{formatDateLabel(concern.createdAt)}</p>
                        </div>
                        <Button
                          className="h-10 bg-blue-600 text-sm font-black hover:bg-blue-700"
                          onClick={() => handleRequestMatch(concern.id)}
                        >
                          {linkedThread ? "이어서 보기" : "요청하기"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="overflow-hidden border-blue-100 shadow-none">
              <CardContent className="relative min-h-[520px] p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-slate-950">고민 현황</h3>
                  <div className="mt-5 space-y-3">
                    {[
                      { label: "전체", count: totalConcerns, icon: List, tone: "text-blue-700" },
                      { label: "답변 대기", count: waitingConcerns, icon: Clock3, tone: "text-blue-700" },
                      { label: "상담중", count: inProgressConcerns, icon: MessageCircle, tone: "text-emerald-700" },
                      { label: "답변 완료", count: doneConcerns, icon: CheckCircle2, tone: "text-violet-700" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-xl border border-white bg-white/90 px-4 py-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3 text-sm font-black text-slate-700">
                            <Icon className={cn("h-4 w-4", item.tone)} />
                            {item.label}
                          </div>
                          <span className="text-xl font-black text-slate-950">{item.count}건</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative z-10 mt-8 rounded-2xl border border-dashed border-blue-100 bg-white/82 p-5 text-center shadow-sm">
                  <Mapjiri level={currentLevel.level} className="mx-auto h-24 w-24" />
                  <p className="mt-4 text-lg font-black text-slate-950">
                    레벨별 맵지리와 함께
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-500">
                    저장한 고민 수와 상담 상태는 자동으로 집계돼요.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="mt-5">
            {orderedThreads.length === 0 ? (
              <Card className="border-dashed border-blue-200 shadow-none">
                <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                  <Mapjiri level={currentLevel.level} className="h-24 w-24" />
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">아직 생성된 매칭이 없어요</h3>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      고민 목록에서 요청하기를 눌러 메시지함을 시작해보세요.
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab("list")}>고민 목록으로 이동</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
                <Card className="overflow-hidden border-slate-200 shadow-none">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                      <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                        전체 {orderedThreads.length}
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="text-xs font-bold text-slate-400">최근 순</div>
                    </div>

                    <div className="max-h-[640px] overflow-y-auto">
                      {orderedThreads.map((thread) => {
                        const tutor = TUTORS.find((item) => item.id === thread.tutorId);
                        const concern = concerns.find((item) => item.id === thread.concernId);
                        if (!tutor || !concern) {
                          return null;
                        }

                        const isActive = selectedThread?.id === thread.id;
                        const lastMessage = thread.messages[thread.messages.length - 1];

                        return (
                          <button
                            key={thread.id}
                            type="button"
                            onClick={() => {
                              setSelectedThreadId(thread.id);
                              setActiveTab("messages");
                            }}
                            className={cn(
                              "flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition-colors",
                              isActive ? "bg-blue-50/70" : "hover:bg-slate-50",
                            )}
                          >
                            <TutorAvatar tutor={tutor} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-black text-slate-950">{tutor.name}</p>
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-[11px]",
                                      thread.stage === "매칭 요청" && "bg-blue-50 text-blue-700",
                                      thread.stage === "상담중" && "bg-emerald-50 text-emerald-700",
                                      thread.stage === "답변 완료" && "bg-violet-50 text-violet-700",
                                    )}
                                  >
                                    {thread.stage}
                                  </Badge>
                                </div>
                                <span className="shrink-0 text-xs font-bold text-slate-400">
                                  {formatRelativeTime(thread.lastUpdatedAt)}
                                </span>
                              </div>
                              <p className="mt-2 truncate text-sm font-bold text-slate-500">{concern.title}</p>
                              <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-slate-500">
                                {lastMessage?.text}
                              </p>
                            </div>
                            {thread.unreadCount > 0 && (
                              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-black text-white">
                                {thread.unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {selectedThread && selectedConcern && selectedTutor ? (
                  <>
                    <Card className="overflow-hidden border-slate-200 shadow-none">
                      <CardContent className="flex h-full min-h-[640px] flex-col p-0">
                        <div className="border-b border-slate-100 px-6 py-5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-2xl font-black text-slate-950">{selectedTutor.name}</p>
                                <Badge
                                  className={cn(
                                    selectedThread.stage === "매칭 요청" && "bg-blue-50 text-blue-700",
                                    selectedThread.stage === "상담중" && "bg-emerald-50 text-emerald-700",
                                    selectedThread.stage === "답변 완료" && "bg-violet-50 text-violet-700",
                                  )}
                                >
                                  {selectedThread.stage}
                                </Badge>
                              </div>
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
                                <span>{selectedTutor.school}</span>
                                <span>·</span>
                                <span>{selectedTutor.major}</span>
                                <span>·</span>
                                <span>{selectedConcern.method}</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                              Lv.{selectedTutor.level} {getLevelMeta(selectedTutor.level).name}
                            </Badge>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {selectedConcern.fields.map((field) => (
                              <Badge key={field} variant="secondary" className="bg-blue-50 text-blue-700">
                                {field}
                              </Badge>
                            ))}
                            {selectedTutor.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="bg-white text-slate-600">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 px-6 py-5">
                          <div className="text-center text-xs font-black text-slate-400">
                            {formatDateLabel(selectedThread.messages[0]?.createdAt ?? Date.now())}
                          </div>

                          {selectedThread.messages.map((message) => {
                            const isUser = message.sender === "user";
                            const isSystem = message.sender === "system";

                            return (
                              <div
                                key={message.id}
                                className={cn(
                                  "flex",
                                  isUser ? "justify-end" : "justify-start",
                                  isSystem && "justify-center",
                                )}
                              >
                                {isSystem ? (
                                  <div className="max-w-[80%] rounded-full bg-white px-4 py-2 text-center text-xs font-bold text-slate-500 shadow-sm">
                                    {message.text}
                                  </div>
                                ) : (
                                  <div className={cn("max-w-[80%]", isUser ? "items-end" : "items-start")}>
                                    <div className={cn("mb-2 text-xs font-black text-slate-400", isUser ? "text-right" : "text-left")}>
                                      {isUser ? ROADIN_USER.name : selectedTutor.name} · {formatTimeLabel(message.createdAt)}
                                    </div>
                                    <div
                                      className={cn(
                                        "rounded-2xl px-4 py-3 text-sm font-bold leading-6 shadow-sm",
                                        isUser
                                          ? "rounded-br-md bg-blue-600 text-white"
                                          : "rounded-bl-md bg-white text-slate-700",
                                      )}
                                    >
                                      {message.text}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="border-t border-slate-100 px-6 py-4">
                          <div className="flex gap-3">
                            <Input
                              value={messageDraft}
                              onChange={(event) => setMessageDraft(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                  event.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              disabled={selectedThread.stage === "답변 완료"}
                              placeholder={
                                selectedThread.stage === "답변 완료"
                                  ? "답변 완료된 상담입니다."
                                  : "메시지를 입력하세요..."
                              }
                              className="h-12 rounded-xl border-slate-200 bg-white"
                            />
                            <Button
                              className="h-12 shrink-0 bg-blue-600 px-5 text-sm font-black hover:bg-blue-700"
                              onClick={handleSendMessage}
                              disabled={selectedThread.stage === "답변 완료"}
                            >
                              <Send className="h-4 w-4" />
                              전송
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-blue-100 shadow-none">
                      <CardContent className="space-y-5 p-6">
                        <div>
                          <h3 className="text-2xl font-black text-slate-950">상담 정보</h3>
                          <p className="mt-2 text-sm font-bold text-slate-500">
                            시간과 코인을 확인한 뒤 상담을 확정해보세요.
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-black text-slate-500">희망 상담 시간</p>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {TIME_OPTIONS.map((minutes) => (
                              <button
                                key={minutes}
                                type="button"
                                onClick={() => handleSelectMinutes(minutes)}
                                className={cn(
                                  "rounded-lg border px-3 py-2 text-sm font-black transition-colors",
                                  selectedThread.selectedMinutes === minutes
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700",
                                )}
                              >
                                {minutes}분
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                            <span>튜터 등급</span>
                            <span className="flex items-center gap-1.5 font-black text-slate-950">
                              <TransportIcon level={selectedTutor.level} className="h-4 w-4 text-blue-600" />
                              Lv.{selectedTutor.level} {getLevelMeta(selectedTutor.level).name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                            <span>시간 환산</span>
                            <span className="font-black text-slate-950">
                              10분 = {selectedTutor.level}코인
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                            <span>계산 방식</span>
                            <span className="font-black text-slate-950">
                              {selectedThread.selectedMinutes}분 ÷ 10 × {selectedTutor.level}
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                          <p className="text-sm font-black text-blue-700">총 지급 코인</p>
                          <div className="mt-3 flex items-end justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-500">현재 보유 코인</p>
                              <p className="mt-1 text-lg font-black text-slate-950">{coinBalance} 코인</p>
                            </div>
                            <div className="flex items-center gap-2 text-3xl font-black text-blue-700">
                              <Coins className="h-6 w-6 text-amber-500" />
                              {selectedCost}
                            </div>
                          </div>
                          <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
                            상담 코인 = (상담 시간 ÷ 10) × 튜터 레벨
                          </p>
                        </div>

                        {paymentError && (
                          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {paymentError}
                          </div>
                        )}

                        <div className="rounded-2xl border border-dashed border-amber-100 bg-amber-50/70 p-4 text-sm font-bold leading-6 text-slate-600">
                          <p className="flex items-center gap-2 text-amber-700">
                            <Sparkles className="h-4 w-4" />
                            코인 계산 방식
                          </p>
                          <p className="mt-2">
                            상담 시간(분) ÷ 10 × 튜터 레벨 = 지급 코인
                          </p>
                          <p className="mt-2">예시: 20분, Lv.1 튜터면 20 코인</p>
                          <p>예시: 30분, Lv.3 튜터면 90 코인</p>
                        </div>

                        <div className="grid gap-2">
                          {!selectedThread.paymentConfirmed && (
                            <Button
                              variant="outline"
                              className="h-11 border-slate-200"
                              onClick={handleCancelRequest}
                            >
                              요청 취소
                            </Button>
                          )}
                          {selectedThread.paymentConfirmed && selectedConcern.status !== "답변 완료" && (
                            <Button
                              variant="outline"
                              className="h-11 border-slate-200"
                              onClick={handleCompleteConsult}
                            >
                              답변 완료 처리
                            </Button>
                          )}
                          <Button
                            className="h-12 bg-blue-600 text-sm font-black hover:bg-blue-700 disabled:bg-slate-300"
                            onClick={handleConfirmPayment}
                            disabled={selectedThread.paymentConfirmed || selectedThread.stage === "답변 완료"}
                          >
                            {selectedThread.paymentConfirmed
                              ? "상담 확정 완료"
                              : "매칭 수락하고 결제하기"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : null}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
