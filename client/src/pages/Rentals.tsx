import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  Coins,
  Heart,
  MapPin,
  MessageCircle,
  Monitor,
  Plus,
  Search,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getGrowthLevel, growthLevels, Mapjiri, TransportIcon } from "@/lib/roadin";

type RentalTab = "seminar" | "study" | "meeting";
type SortOption = "recommended" | "price-low" | "price-high" | "capacity-high" | "newest";

type RentalSpace = {
  id: string;
  category: RentalTab;
  name: string;
  description: string;
  location: string;
  region: string;
  capacity: number;
  originalPrice: number;
  amenities: string[];
  image: string;
  availableDates: string[];
  availableTimes: string[];
  createdAt: number;
};

type BookingRecord = {
  id: string;
  spaceId: string;
  date: string;
  time: string;
  finalPrice: number;
  createdAt: number;
};

type NoticeState = {
  tone: "success" | "info" | "error";
  message: string;
};

type RegisterFormState = {
  name: string;
  description: string;
  location: string;
  region: string;
  capacity: string;
  price: string;
  amenities: string;
  imageUrl: string;
  availableDate: string;
};

const STORAGE_KEYS = {
  favorites: "roadin-rentals-favorites-v1",
  customSpaces: "roadin-rentals-custom-spaces-v1",
  bookings: "roadin-rentals-bookings-v1",
};

const RENTAL_USER = {
  name: "김맵지",
  coins: 750,
};

const DEFAULT_AVAILABLE_TIMES = ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

const TAB_META: Record<
  RentalTab,
  {
    label: string;
    icon: LucideIcon;
    heroTitle: string;
    heroDescription: string;
    heroImage: string;
    searchPlaceholder: string;
    discountTitle: string;
    guideItems: string[];
    mascotCaption: string;
  }
> = {
  seminar: {
    label: "세미나실",
    icon: Monitor,
    heroTitle: "세미나실을 효율적으로 예약하고, 등급별 할인 혜택도 챙기세요!",
    heroDescription: "강연, 발표, 세미나 진행에 적합한 공간을 등급별 할인과 함께 예약해보세요.",
    heroImage:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200&h=700",
    searchPlaceholder: "세미나실 이름이나 키워드를 검색하세요",
    discountTitle: "세미나실 할인 안내",
    guideItems: [
      "등급별 할인은 결제 시 자동 적용돼요.",
      "예약 변경/취소는 이용 시간 2시간 전까지 가능해요.",
      "강연 장비 사용 여부를 사전에 확인해주세요.",
    ],
    mascotCaption: "필요한 세미나 공간을 빠르게 찾고, 더 큰 기회를 준비해보세요!",
  },
  study: {
    label: "스터디룸",
    icon: BookOpenCheck,
    heroTitle: "스터디룸을 실속 있게 예약하고, 등급별 할인 혜택도 챙기세요!",
    heroDescription: "조용한 학습 공간에서 더 집중하세요. 등급에 따라 최대 20%까지 할인됩니다.",
    heroImage:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1200&h=700",
    searchPlaceholder: "스터디룸 이름이나 키워드를 검색하세요",
    discountTitle: "스터디룸 할인 안내",
    guideItems: [
      "등급별 할인은 결제 시 자동 적용돼요.",
      "예약 변경/취소는 이용 시간 2시간 전까지 가능해요.",
      "쾌적한 이용을 위해 정숙한 분위기를 유지해주세요.",
    ],
    mascotCaption: "조용한 공간에서 더 집중하고, 더 큰 성장을 만들어 보세요!",
  },
  meeting: {
    label: "회의실",
    icon: Users,
    heroTitle: "회의실을 간편하게 예약하고, 등급별 할인 혜택도 받으세요!",
    heroDescription: "팀 회의, 면접, 브레인스토밍, 프로젝트 협업에 최적화된 공간을 만나보세요.",
    heroImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200&h=700",
    searchPlaceholder: "회의실 이름이나 키워드를 검색하세요",
    discountTitle: "회의실 할인 안내",
    guideItems: [
      "회의실 예약은 결제 시 자동 적용돼요.",
      "예약 변경/취소는 이용 시간 24시간 전까지 가능해요.",
      "회의실 내 음식물 반입은 지정 구역에서만 가능해요.",
    ],
    mascotCaption: "효율적인 회의를 위한 최적의 공간, 지금 바로 예약해보세요!",
  },
};

const BASE_SPACES: RentalSpace[] = [
  {
    id: "seminar-1",
    category: "seminar",
    name: "아주대 팔달관 세미나실 A",
    description: "프로젝터, 스크린, 마이크 완비",
    location: "경기 수원시 영통구",
    region: "경기 수원시",
    capacity: 40,
    originalPrice: 50000,
    amenities: ["프로젝터", "스크린", "마이크"],
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800&h=600",
    availableDates: ["2026-05-11", "2026-05-12", "2026-05-14", "2026-05-17"],
    availableTimes: DEFAULT_AVAILABLE_TIMES,
    createdAt: Date.parse("2026-05-01"),
  },
  {
    id: "seminar-2",
    category: "seminar",
    name: "인천 송도 프리미엄 세미나홀",
    description: "대형 스크린, 음향 장비, Wi-Fi",
    location: "인천 연수구 송도동",
    region: "인천 연수구",
    capacity: 60,
    originalPrice: 45000,
    amenities: ["대형 스크린", "음향 장비", "Wi-Fi"],
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800&h=600",
    availableDates: ["2026-05-10", "2026-05-13", "2026-05-15", "2026-05-18"],
    availableTimes: DEFAULT_AVAILABLE_TIMES,
    createdAt: Date.parse("2026-05-03"),
  },
  {
    id: "seminar-3",
    category: "seminar",
    name: "광교 소규모 발표실",
    description: "화이트보드, 모니터, 콘센트",
    location: "경기 수원시 영통구 광교",
    region: "경기 수원시",
    capacity: 12,
    originalPrice: 18000,
    amenities: ["화이트보드", "모니터", "콘센트"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800&h=600",
    availableDates: ["2026-05-11", "2026-05-12", "2026-05-16"],
    availableTimes: DEFAULT_AVAILABLE_TIMES,
    createdAt: Date.parse("2026-05-04"),
  },
  {
    id: "study-1",
    category: "study",
    name: "아주대 교내 스터디룸 A",
    description: "화이트보드, 콘센트, Wi-Fi",
    location: "경기 수원시 영통구 원천동",
    region: "경기 수원시",
    capacity: 6,
    originalPrice: 12000,
    amenities: ["화이트보드", "콘센트", "Wi-Fi"],
    image:
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&q=80&w=800&h=600",
    availableDates: ["2026-05-10", "2026-05-11", "2026-05-13", "2026-05-14"],
    availableTimes: DEFAULT_AVAILABLE_TIMES,
    createdAt: Date.parse("2026-05-02"),
  },
  {
    id: "study-2",
    category: "study",
    name: "인천 부평 조용한 스터디룸 B",
    description: "모니터, 에어컨, 콘센트",
    location: "인천 부평구 부평동",
    region: "인천 부평구",
    capacity: 4,
    originalPrice: 14000,
    amenities: ["모니터", "에어컨", "콘센트"],
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=800&h=600",
    availableDates: ["2026-05-12", "2026-05-13", "2026-05-15", "2026-05-18"],
    availableTimes: DEFAULT_AVAILABLE_TIMES,
    createdAt: Date.parse("2026-05-05"),
  },
  {
    id: "study-3",
    category: "study",
    name: "광교 팀플 스터디룸 C",
    description: "화이트보드, 콘센트, Wi-Fi",
    location: "경기 수원시 영통구 광교",
    region: "경기 수원시",
    capacity: 8,
    originalPrice: 16000,
    amenities: ["화이트보드", "콘센트", "Wi-Fi"],
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=800&h=600",
    availableDates: ["2026-05-10", "2026-05-12", "2026-05-16", "2026-05-19"],
    availableTimes: DEFAULT_AVAILABLE_TIMES,
    createdAt: Date.parse("2026-05-06"),
  },
  {
    id: "meeting-1",
    category: "meeting",
    name: "수원 광교 회의실 A",
    description: "화이트보드, 모니터, 화상회의, 콘센트",
    location: "경기 수원시 영통구 광교",
    region: "경기 수원시",
    capacity: 6,
    originalPrice: 56000,
    amenities: ["화이트보드", "모니터", "화상회의", "콘센트"],
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800&h=600",
    availableDates: ["2026-05-11", "2026-05-12", "2026-05-13", "2026-05-16"],
    availableTimes: DEFAULT_AVAILABLE_TIMES,
    createdAt: Date.parse("2026-05-01"),
  },
  {
    id: "meeting-2",
    category: "meeting",
    name: "인천 송도 프리미엄 회의실",
    description: "화이트보드, 모니터, 노트북 연결, 회의 테이블",
    location: "인천 연수구 송도동",
    region: "인천 연수구",
    capacity: 12,
    originalPrice: 45000,
    amenities: ["화이트보드", "모니터", "노트북 연결", "회의 테이블"],
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800&h=600",
    availableDates: ["2026-05-10", "2026-05-14", "2026-05-17", "2026-05-18"],
    availableTimes: DEFAULT_AVAILABLE_TIMES,
    createdAt: Date.parse("2026-05-03"),
  },
  {
    id: "meeting-3",
    category: "meeting",
    name: "안양 소규모 회의실",
    description: "화이트보드, 모니터, 콘센트",
    location: "경기 안양시 동안구",
    region: "경기 안양시",
    capacity: 6,
    originalPrice: 18000,
    amenities: ["화이트보드", "모니터", "콘센트"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800&h=600",
    availableDates: ["2026-05-12", "2026-05-13", "2026-05-15"],
    availableTimes: DEFAULT_AVAILABLE_TIMES,
    createdAt: Date.parse("2026-05-04"),
  },
];

function readStored<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures in restricted webviews.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const nextValues = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return nextValues.length > 0 ? nextValues : fallback;
}

function normalizeFavorites(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function normalizeBookings(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const {
      id,
      spaceId,
      date,
      time,
      finalPrice,
      createdAt,
    } = item;

    if (
      typeof id !== "string"
      || typeof spaceId !== "string"
      || typeof date !== "string"
      || typeof time !== "string"
      || typeof finalPrice !== "number"
      || typeof createdAt !== "number"
    ) {
      return [];
    }

    return [{ id, spaceId, date, time, finalPrice, createdAt } satisfies BookingRecord];
  });
}

function normalizeSpaces(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const {
      id,
      category,
      name,
      description,
      location,
      region,
      capacity,
      originalPrice,
      amenities,
      image,
      availableDates,
      availableTimes,
      createdAt,
    } = item;

    const isValidCategory = category === "seminar" || category === "study" || category === "meeting";

    if (
      typeof id !== "string"
      || !isValidCategory
      || typeof name !== "string"
      || typeof description !== "string"
      || typeof location !== "string"
      || typeof region !== "string"
      || typeof capacity !== "number"
      || typeof originalPrice !== "number"
      || typeof image !== "string"
      || typeof createdAt !== "number"
    ) {
      return [];
    }

    return [
      {
        id,
        category,
        name,
        description,
        location,
        region,
        capacity,
        originalPrice,
        amenities: getStringArray(amenities, ["기본 시설 제공"]),
        image,
        availableDates: getStringArray(availableDates, [new Date().toISOString().slice(0, 10)]),
        availableTimes: getStringArray(availableTimes, DEFAULT_AVAILABLE_TIMES),
        createdAt,
      } satisfies RentalSpace,
    ];
  });
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatPrice(price: number) {
  return `${price.toLocaleString()}원`;
}

function getDiscountedPrice(originalPrice: number, discountRate: number) {
  return Math.round(originalPrice * (1 - discountRate / 100));
}

function getLevelMeta(level: number) {
  return growthLevels.find((item) => item.level === level) ?? growthLevels[0];
}

function getDefaultImage(tab: RentalTab) {
  return TAB_META[tab].heroImage;
}

function getInitialRegisterForm() {
  return {
    name: "",
    description: "",
    location: "",
    region: "",
    capacity: "",
    price: "",
    amenities: "",
    imageUrl: "",
    availableDate: "",
  } satisfies RegisterFormState;
}

export function Rentals() {
  const currentLevel = getGrowthLevel(RENTAL_USER.coins);
  const [activeTab, setActiveTab] = useState<RentalTab>("seminar");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [capacityFilter, setCapacityFilter] = useState("all");
  const [availableDate, setAvailableDate] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    normalizeFavorites(readStored<unknown>(STORAGE_KEYS.favorites, [])),
  );
  const [customSpaces, setCustomSpaces] = useState<RentalSpace[]>(() =>
    normalizeSpaces(readStored<unknown>(STORAGE_KEYS.customSpaces, [])),
  );
  const [bookings, setBookings] = useState<BookingRecord[]>(() =>
    normalizeBookings(readStored<unknown>(STORAGE_KEYS.bookings, [])),
  );
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingSpaceId, setBookingSpaceId] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(getInitialRegisterForm);
  const [registerError, setRegisterError] = useState("");

  const tabMeta = TAB_META[activeTab];
  const allSpaces = useMemo(() => [...customSpaces, ...BASE_SPACES], [customSpaces]);
  const currentTabSpaces = useMemo(
    () => allSpaces.filter((space) => space.category === activeTab),
    [activeTab, allSpaces],
  );

  const regionOptions = useMemo(
    () => Array.from(new Set(currentTabSpaces.map((space) => space.region))),
    [currentTabSpaces],
  );

  const visibleSpaces = useMemo(() => {
    const capacityMinimum = capacityFilter === "all" ? 0 : Number(capacityFilter);
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = currentTabSpaces.filter((space) => {
      const matchesQuery =
        normalizedQuery.length === 0
        || [
          space.name,
          space.description,
          space.location,
          ...space.amenities,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesRegion = selectedRegion === "all" || space.region === selectedRegion;
      const matchesCapacity = capacityMinimum === 0 || space.capacity >= capacityMinimum;
      const matchesDate = availableDate === "" || space.availableDates.includes(availableDate);

      return matchesQuery && matchesRegion && matchesCapacity && matchesDate;
    });

    return [...filtered].sort((left, right) => {
      const leftDiscounted = getDiscountedPrice(left.originalPrice, currentLevel.discount);
      const rightDiscounted = getDiscountedPrice(right.originalPrice, currentLevel.discount);

      if (sortOption === "price-low") {
        return leftDiscounted - rightDiscounted;
      }

      if (sortOption === "price-high") {
        return rightDiscounted - leftDiscounted;
      }

      if (sortOption === "capacity-high") {
        return right.capacity - left.capacity;
      }

      if (sortOption === "newest") {
        return right.createdAt - left.createdAt;
      }

      return left.name.localeCompare(right.name, "ko");
    });
  }, [availableDate, capacityFilter, currentLevel.discount, currentTabSpaces, searchQuery, selectedRegion, sortOption]);

  const bookingSpace = allSpaces.find((space) => space.id === bookingSpaceId) ?? null;
  const bookingFinalPrice = bookingSpace
    ? getDiscountedPrice(bookingSpace.originalPrice, currentLevel.discount)
    : 0;

  useEffect(() => {
    writeStored(STORAGE_KEYS.favorites, favoriteIds);
  }, [favoriteIds]);

  useEffect(() => {
    writeStored(STORAGE_KEYS.customSpaces, customSpaces);
  }, [customSpaces]);

  useEffect(() => {
    writeStored(STORAGE_KEYS.bookings, bookings);
  }, [bookings]);

  useEffect(() => {
    setSearchQuery("");
    setSelectedRegion("all");
    setCapacityFilter("all");
    setAvailableDate("");
    setSortOption("recommended");
  }, [activeTab]);

  useEffect(() => {
    if (selectedRegion !== "all" && !regionOptions.includes(selectedRegion)) {
      setSelectedRegion("all");
    }
  }, [regionOptions, selectedRegion]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeoutId = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  function toggleFavorite(spaceId: string) {
    setFavoriteIds((previousIds) =>
      previousIds.includes(spaceId)
        ? previousIds.filter((id) => id !== spaceId)
        : [...previousIds, spaceId],
    );
  }

  function openBookingModal(space: RentalSpace) {
    setBookingSpaceId(space.id);
    setBookingDate(space.availableDates[0] ?? "");
    setBookingTime(space.availableTimes[0] ?? "");
    setBookingError("");
    setIsBookingOpen(true);
  }

  function handleBookSpace() {
    if (!bookingSpace) {
      return;
    }

    if (!bookingDate || !bookingTime) {
      setBookingError("날짜와 시간을 모두 선택해주세요.");
      return;
    }

    const nextBooking: BookingRecord = {
      id: createId("booking"),
      spaceId: bookingSpace.id,
      date: bookingDate,
      time: bookingTime,
      finalPrice: bookingFinalPrice,
      createdAt: Date.now(),
    };

    setBookings((previousBookings) => [nextBooking, ...previousBookings]);
    setIsBookingOpen(false);
    setNotice({
      tone: "success",
      message: `${bookingSpace.name} 예약이 완료되었어요. ${bookingDate} ${bookingTime} 일정으로 저장했습니다.`,
    });
  }

  function handleOpenRegisterModal() {
    setRegisterForm(getInitialRegisterForm());
    setRegisterError("");
    setIsRegisterOpen(true);
  }

  function handleCreateSpace() {
    const {
      name,
      description,
      location,
      region,
      capacity,
      price,
      amenities,
      imageUrl,
      availableDate,
    } = registerForm;

    if (
      !name.trim()
      || !description.trim()
      || !location.trim()
      || !region.trim()
      || !capacity.trim()
      || !price.trim()
      || !amenities.trim()
      || !availableDate.trim()
    ) {
      setRegisterError("모든 항목을 입력해주세요.");
      return;
    }

    const parsedCapacity = Number(capacity);
    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedCapacity) || parsedCapacity <= 0 || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setRegisterError("수용 인원과 가격은 1 이상 숫자로 입력해주세요.");
      return;
    }

    const nextSpace: RentalSpace = {
      id: createId("space"),
      category: activeTab,
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      region: region.trim(),
      capacity: parsedCapacity,
      originalPrice: parsedPrice,
      amenities: amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      image: imageUrl.trim() || getDefaultImage(activeTab),
      availableDates: [availableDate.trim()],
      availableTimes: DEFAULT_AVAILABLE_TIMES,
      createdAt: Date.now(),
    };

    setCustomSpaces((previousSpaces) => [nextSpace, ...previousSpaces]);
    setIsRegisterOpen(false);
    setNotice({
      tone: "success",
      message: `${TAB_META[activeTab].label} 목록에 ${nextSpace.name} 공간이 추가되었어요.`,
    });
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedRegion("all");
    setCapacityFilter("all");
    setAvailableDate("");
    setSortOption("recommended");
  }

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-[28px] border border-blue-100 bg-white p-4 shadow-[0_16px_50px_rgba(37,99,235,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-[470px]">
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="검색어를 입력하세요"
                className="h-12 rounded-full border-blue-100 pl-5 pr-12 text-sm font-bold shadow-sm"
              />
              <Search className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-700" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            <div className="flex items-center gap-2 text-sm font-black text-slate-800">
              <Coins className="h-5 w-5 text-amber-500" />
              {RENTAL_USER.coins} 코인
            </div>
            <div className="relative">
              <Bell className="h-5 w-5 text-slate-700" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                2
              </span>
            </div>
            <div className="relative">
              <MessageCircle className="h-5 w-5 text-slate-700" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                1
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1.5">
              <Mapjiri level={currentLevel.level} className="h-9 w-9 shrink-0" />
              <span className="text-sm font-black text-slate-900">{RENTAL_USER.name}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_18px_60px_rgba(37,99,235,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950">대관 서비스</h1>
            <p className="mt-2 text-sm font-bold text-slate-500">
              공간 유형별로 맞춤 대관을 찾고, 붕붕이 등급 10% 할인도 함께 받아보세요.
            </p>
          </div>
          <Badge className="hidden bg-blue-50 text-blue-700 hover:bg-blue-50 sm:inline-flex">
            Lv.{currentLevel.level} {currentLevel.name} · 기본 할인 {currentLevel.discount}%
          </Badge>
        </div>

        {notice && (
          <div
            className={cn(
              "mt-5 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold",
              notice.tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700",
              notice.tone === "info" && "border-blue-200 bg-blue-50 text-blue-700",
              notice.tone === "error" && "border-red-200 bg-red-50 text-red-700",
            )}
          >
            {notice.tone === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {notice.message}
          </div>
        )}

        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_242px]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(TAB_META) as RentalTab[]).map((tab) => {
                const meta = TAB_META[tab];
                const Icon = meta.icon;
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex h-12 items-center justify-center gap-2 rounded-2xl border text-base font-black transition-colors",
                      isActive
                        ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                        : "border-blue-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {meta.label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-[26px] border border-blue-100 bg-[linear-gradient(135deg,#f7fbff_0%,#eef5ff_100%)]">
              <div className="grid lg:grid-cols-[1fr_360px]">
                <div className="relative z-10 px-6 py-6">
                  <h2 className="max-w-[640px] text-[2rem] font-black leading-tight text-slate-950">
                    {tabMeta.heroTitle}
                  </h2>
                  <p className="mt-3 max-w-[560px] text-sm font-bold leading-6 text-slate-600">
                    {tabMeta.heroDescription}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[5, 4, 3].map((level) => {
                      const meta = getLevelMeta(level);
                      const isCurrent = level === currentLevel.level;
                      return (
                        <div
                          key={level}
                          className={cn(
                            "rounded-2xl border bg-white/90 p-4 shadow-sm",
                            isCurrent ? "border-blue-200 ring-2 ring-blue-100" : "border-white/90",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-11 w-11 items-center justify-center rounded-full", meta.tone)}>
                              <TransportIcon level={level} className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{meta.name}</p>
                              <p className="text-2xl font-black text-blue-700">{meta.discount}% 할인</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="relative min-h-[250px] border-t border-blue-100 lg:border-l lg:border-t-0">
                  <img
                    src={tabMeta.heroImage}
                    alt={tabMeta.label}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(238,245,255,0.98)_0%,rgba(238,245,255,0.92)_28%,rgba(238,245,255,0.22)_72%,rgba(238,245,255,0.08)_100%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_26%,rgba(255,255,255,0.55),transparent_22%),radial-gradient(circle_at_70%_80%,rgba(191,219,254,0.4),transparent_18%)]" />
                  <div className="absolute left-6 top-6 rounded-xl bg-white/90 px-3 py-2 shadow-sm">
                    <p className="text-xs font-black text-blue-600">{tabMeta.label} 추천 포인트</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {activeTab === "seminar" && "발표/강연 준비에 최적화"}
                      {activeTab === "study" && "집중과 협업을 모두 챙기기"}
                      {activeTab === "meeting" && "팀 회의와 면접 진행에 적합"}
                    </p>
                  </div>
                  <div className="absolute bottom-5 right-5">
                    <div className="relative">
                      <div className="absolute inset-x-3 bottom-0 h-4 rounded-full bg-blue-900/10 blur-md" />
                      <Mapjiri level={currentLevel.level} className="relative h-28 w-28" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]">
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={tabMeta.searchPlaceholder}
                  className="h-12 rounded-2xl border-blue-100 bg-white pl-4 pr-11 text-sm font-bold"
                />
                <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-700" />
              </div>

              <select
                value={selectedRegion}
                onChange={(event) => setSelectedRegion(event.target.value)}
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none"
              >
                <option value="all">전체 지역</option>
                {regionOptions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>

              <select
                value={capacityFilter}
                onChange={(event) => setCapacityFilter(event.target.value)}
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none"
              >
                <option value="all">수용 인원</option>
                <option value="4">4명 이상</option>
                <option value="6">6명 이상</option>
                <option value="8">8명 이상</option>
                <option value="12">12명 이상</option>
                <option value="20">20명 이상</option>
              </select>

              <Input
                type="date"
                value={availableDate}
                onChange={(event) => setAvailableDate(event.target.value)}
                className="h-12 rounded-2xl border-blue-100 bg-white px-4 text-sm font-bold text-slate-700"
              />

              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value as SortOption)}
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm outline-none"
              >
                <option value="recommended">정렬</option>
                <option value="price-low">가격 낮은순</option>
                <option value="price-high">가격 높은순</option>
                <option value="capacity-high">인원 많은순</option>
                <option value="newest">최신 등록순</option>
              </select>

              <Button
                className="h-12 rounded-2xl bg-blue-600 px-5 text-sm font-black hover:bg-blue-700"
                onClick={handleOpenRegisterModal}
              >
                <Plus className="h-4 w-4" />
                대관 신청하기
              </Button>
            </div>

            {visibleSpaces.length === 0 ? (
              <Card className="rounded-[24px] border-dashed border-blue-200 shadow-none">
                <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
                  <Mapjiri level={currentLevel.level} className="h-24 w-24" />
                  <div>
                    <h3 className="text-2xl font-black text-slate-950">조건에 맞는 공간이 아직 없어요</h3>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      검색어나 필터를 조정하거나, 새 공간을 직접 등록해보세요.
                    </p>
                  </div>
                  <Button variant="outline" onClick={clearFilters}>
                    필터 초기화
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-3">
                {visibleSpaces.map((space) => {
                  const discountedPrice = getDiscountedPrice(space.originalPrice, currentLevel.discount);
                  const isFavorite = favoriteIds.includes(space.id);
                  const bookingCount = bookings.filter((booking) => booking.spaceId === space.id).length;

                  return (
                    <Card
                      key={space.id}
                      className="flex flex-col overflow-hidden rounded-[24px] border-blue-100 shadow-[0_12px_32px_rgba(37,99,235,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.12)]"
                    >
                      <CardContent className="flex flex-1 flex-col p-4">
                        <div className="relative overflow-hidden rounded-[18px]">
                          <img
                            src={space.image}
                            alt={space.name}
                            className="h-44 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => toggleFavorite(space.id)}
                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 shadow-sm"
                            aria-label={isFavorite ? "찜 해제" : "찜하기"}
                          >
                            <Heart
                              className={cn(
                                "h-5 w-5",
                                isFavorite ? "fill-blue-600 text-blue-600" : "text-slate-600",
                              )}
                            />
                          </button>
                          {bookingCount > 0 && (
                            <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white shadow-sm">
                              예약 {bookingCount}건
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-1 flex-col">
                          <h3 className="truncate text-base font-black text-slate-950">{space.name}</h3>
                          <p className="mt-1 truncate text-sm font-bold text-slate-500">
                            {space.description}
                          </p>

                          <div className="mt-2 space-y-1 text-sm font-bold text-slate-600">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                              <span className="truncate">{space.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                              최대 {space.capacity}명
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {space.amenities.slice(0, 3).map((amenity) => (
                              <Badge
                                key={amenity}
                                variant="secondary"
                                className="bg-slate-50 text-xs text-slate-600 hover:bg-slate-50"
                              >
                                {amenity}
                              </Badge>
                            ))}
                          </div>

                          <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-400 line-through">
                                {formatPrice(space.originalPrice)}
                              </p>
                              <p className="text-lg font-black text-blue-700 whitespace-nowrap">
                                {formatPrice(discountedPrice)}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <Badge className="whitespace-nowrap bg-blue-50 text-xs text-blue-700 hover:bg-blue-50">
                                {currentLevel.name} {currentLevel.discount}% 할인
                              </Badge>
                              <Button
                                className="h-9 rounded-xl bg-blue-600 px-4 text-sm font-black hover:bg-blue-700"
                                onClick={() => openBookingModal(space)}
                              >
                                예약하기
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <Card className="rounded-[24px] border-blue-100 shadow-none">
              <CardContent className="space-y-3 p-5">
                <h3 className="text-2xl font-black text-slate-950">{tabMeta.discountTitle}</h3>
                {[5, 4, 3].map((level) => {
                  const meta = getLevelMeta(level);
                  const isCurrent = level === currentLevel.level;
                  return (
                    <div
                      key={level}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border bg-white px-4 py-3 shadow-sm",
                        isCurrent ? "border-blue-200 ring-2 ring-blue-100" : "border-slate-100",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", meta.tone)}>
                          <TransportIcon level={level} className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-black text-slate-800">{meta.name}</span>
                      </div>
                      <span className="text-2xl font-black text-blue-700">{meta.discount}%</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-blue-100 shadow-none">
              <CardContent className="p-5">
                <h3 className="text-2xl font-black text-slate-950">이용 안내</h3>
                <div className="mt-4 space-y-3">
                  {tabMeta.guideItems.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm font-bold leading-6 text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[24px] border-blue-100 shadow-none">
              <CardContent className="relative p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="absolute inset-x-4 bottom-0 h-4 rounded-full bg-blue-900/10 blur-md" />
                    <Mapjiri level={currentLevel.level} className="relative h-28 w-28" />
                  </div>
                  <p className="mt-4 text-base font-black leading-7 text-slate-800">
                    {tabMeta.mascotCaption}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-2 text-sm font-black text-blue-700 shadow-sm whitespace-nowrap">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    현재 할인 {currentLevel.discount}% 자동 적용
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-[560px] rounded-[28px] border-blue-100 bg-white p-0">
          <div className="rounded-t-[28px] bg-[linear-gradient(135deg,#f7fbff_0%,#eef5ff_100%)] px-6 py-5">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-2xl font-black text-slate-950">예약하기</DialogTitle>
              <DialogDescription className="text-sm font-bold text-slate-500">
                날짜와 시간을 선택하면 할인율과 최종 금액을 바로 확인할 수 있어요.
              </DialogDescription>
            </DialogHeader>
          </div>

          {bookingSpace && (
            <div className="space-y-5 px-6 py-6">
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <img
                  src={bookingSpace.image}
                  alt={bookingSpace.name}
                  className="h-24 w-24 rounded-2xl object-cover"
                />
                <div>
                  <p className="text-xl font-black text-slate-950">{bookingSpace.name}</p>
                  <p className="mt-2 text-sm font-bold text-slate-500">{bookingSpace.description}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-600">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    {bookingSpace.location}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900">예약 날짜</label>
                  <select
                    value={bookingDate}
                    onChange={(event) => setBookingDate(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none"
                  >
                    {bookingSpace.availableDates.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900">예약 시간</label>
                  <select
                    value={bookingTime}
                    onChange={(event) => setBookingTime(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-blue-100 bg-white px-4 text-sm font-bold text-slate-700 outline-none"
                  >
                    {bookingSpace.availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">기본 금액</span>
                  <span className="text-sm font-bold text-slate-500 line-through">
                    {formatPrice(bookingSpace.originalPrice)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">
                    {currentLevel.name} 할인율
                  </span>
                  <span className="text-xl font-black text-blue-700">{currentLevel.discount}%</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-black text-slate-700">최종 금액</span>
                  <span className="text-3xl font-black text-blue-700">
                    {formatPrice(bookingFinalPrice)}
                  </span>
                </div>
              </div>

              {bookingError && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {bookingError}
                </div>
              )}

              <DialogFooter className="gap-2 px-0 pb-0">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-slate-200"
                  onClick={() => setIsBookingOpen(false)}
                >
                  취소
                </Button>
                <Button
                  className="h-11 rounded-xl bg-blue-600 text-sm font-black hover:bg-blue-700"
                  onClick={handleBookSpace}
                >
                  예약 완료하기
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="max-w-[640px] rounded-[28px] border-blue-100 bg-white p-0">
          <div className="rounded-t-[28px] bg-[linear-gradient(135deg,#f7fbff_0%,#eef5ff_100%)] px-6 py-5">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-2xl font-black text-slate-950">대관 신청하기</DialogTitle>
              <DialogDescription className="text-sm font-bold text-slate-500">
                현재 선택한 {tabMeta.label} 탭에 바로 표시될 새 공간을 등록해보세요.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900">공간 이름</label>
                <Input
                  value={registerForm.name}
                  onChange={(event) =>
                    setRegisterForm((prevForm) => ({ ...prevForm, name: event.target.value }))
                  }
                  placeholder={`${tabMeta.label} 이름`}
                  className="h-12 rounded-2xl border-blue-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900">예약 가능일</label>
                <Input
                  type="date"
                  value={registerForm.availableDate}
                  onChange={(event) =>
                    setRegisterForm((prevForm) => ({ ...prevForm, availableDate: event.target.value }))
                  }
                  className="h-12 rounded-2xl border-blue-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">시설 설명</label>
              <Input
                value={registerForm.description}
                onChange={(event) =>
                  setRegisterForm((prevForm) => ({ ...prevForm, description: event.target.value }))
                }
                placeholder="예) 화이트보드, 마이크, 발표용 스크린"
                className="h-12 rounded-2xl border-blue-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900">위치</label>
                <Input
                  value={registerForm.location}
                  onChange={(event) =>
                    setRegisterForm((prevForm) => ({ ...prevForm, location: event.target.value }))
                  }
                  placeholder="예) 경기 수원시 영통구"
                  className="h-12 rounded-2xl border-blue-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900">지역 필터값</label>
                <Input
                  value={registerForm.region}
                  onChange={(event) =>
                    setRegisterForm((prevForm) => ({ ...prevForm, region: event.target.value }))
                  }
                  placeholder="예) 경기 수원시"
                  className="h-12 rounded-2xl border-blue-100"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900">최대 인원</label>
                <Input
                  type="number"
                  min={1}
                  value={registerForm.capacity}
                  onChange={(event) =>
                    setRegisterForm((prevForm) => ({ ...prevForm, capacity: event.target.value }))
                  }
                  placeholder="예) 8"
                  className="h-12 rounded-2xl border-blue-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900">원가</label>
                <Input
                  type="number"
                  min={1}
                  value={registerForm.price}
                  onChange={(event) =>
                    setRegisterForm((prevForm) => ({ ...prevForm, price: event.target.value }))
                  }
                  placeholder="예) 28000"
                  className="h-12 rounded-2xl border-blue-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">편의 시설</label>
              <Input
                value={registerForm.amenities}
                onChange={(event) =>
                  setRegisterForm((prevForm) => ({ ...prevForm, amenities: event.target.value }))
                }
                placeholder="쉼표로 구분해서 입력해 주세요. 예) Wi-Fi, 콘센트, 모니터"
                className="h-12 rounded-2xl border-blue-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900">이미지 URL</label>
              <Input
                value={registerForm.imageUrl}
                onChange={(event) =>
                  setRegisterForm((prevForm) => ({ ...prevForm, imageUrl: event.target.value }))
                }
                placeholder="비워두면 탭 대표 이미지가 사용돼요."
                className="h-12 rounded-2xl border-blue-100"
              />
            </div>

            {registerError && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                <AlertCircle className="h-4 w-4" />
                {registerError}
              </div>
            )}

            <DialogFooter className="gap-2 px-0 pb-0">
              <Button
                variant="outline"
                className="h-11 rounded-xl border-slate-200"
                onClick={() => setIsRegisterOpen(false)}
              >
                취소
              </Button>
              <Button
                className="h-11 rounded-xl bg-blue-600 text-sm font-black hover:bg-blue-700"
                onClick={handleCreateSpace}
              >
                공간 등록하기
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
