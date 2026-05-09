import { useState } from "react";
import { Bot, FileText, Loader2, Map, Sparkles, Target, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";

type AiMode = "activity" | "portfolio" | "gap";

const modeConfig = {
  activity: {
    title: "활동 추천",
    icon: Map,
    endpoint: "/api/ai/activity-match",
    payloadKey: "spec",
    button: "활동 루트 추천",
    placeholder: "예: 컴퓨터공학 3학년, 프론트엔드 취업 목표, React 프로젝트 1회, 팀 리딩 경험 부족",
    empty: "스펙을 입력하면 다음 목적지와 추천 활동이 표시됩니다.",
  },
  portfolio: {
    title: "포트폴리오 분석",
    icon: FileText,
    endpoint: "/api/ai/portfolio-feedback",
    payloadKey: "portfolio",
    button: "포트폴리오 분석",
    placeholder: "예: React 기반 교내 식단 리뷰 서비스 개발, Zustand 상태관리, 사용자 500명 테스트 완료",
    empty: "포트폴리오 내용을 입력하면 강점과 개선점이 표시됩니다.",
  },
  gap: {
    title: "부족 역량 분석",
    icon: Target,
    endpoint: "/api/ai/activity-match",
    payloadKey: "spec",
    button: "부족 역량 찾기",
    placeholder: "예: 데이터 분석 공모전 수상을 목표로 하지만 SQL 경험이 적고 발표 경험이 부족합니다.",
    empty: "목표와 현재 상태를 입력하면 부족 역량과 보완 루트가 표시됩니다.",
  },
} satisfies Record<AiMode, {
  title: string;
  icon: LucideIcon;
  endpoint: string;
  payloadKey: "spec" | "portfolio";
  button: string;
  placeholder: string;
  empty: string;
}>;

export function AiMatching() {
  const [mode, setMode] = useState<AiMode>("activity");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const current = modeConfig[mode];
  const CurrentIcon = current.icon;

  const handleGenerate = async () => {
    if (!input.trim()) {
      alert("분석할 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const prompt = mode === "gap"
        ? `[부족 역량 분석]\n현재 상태와 목표를 비교해 부족한 역량, 추천 학습 루트, 참여하면 좋은 활동을 구분해 주세요.\n\n${input}`
        : input;
      const data = await apiPost<{ generatedText: string }>(current.endpoint, {
        [current.payloadKey]: prompt,
      });
      setResult(data.generatedText);
    } catch (error) {
      console.error(error);
      alert("AI 분석에 실패했습니다. 백엔드 서버와 Gemini API 키를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Badge className="mb-3 bg-blue-50 text-blue-700 hover:bg-blue-50">
          Mapjiri AI 내비게이션
        </Badge>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">다음 성장 루트를 찾습니다</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
          활동 추천, 포트폴리오 분석, 부족 역량 분석을 한 화면에서 전환하며 확인하세요.
        </p>
      </section>

      <Tabs value={mode} onValueChange={(value) => {
        setMode(value as AiMode);
        setResult("");
      }}>
        <TabsList className="grid h-auto w-full grid-cols-3 bg-white p-1 shadow-sm">
          <TabsTrigger value="activity" className="py-2 font-black">활동 추천</TabsTrigger>
          <TabsTrigger value="portfolio" className="py-2 font-black">포트폴리오 분석</TabsTrigger>
          <TabsTrigger value="gap" className="py-2 font-black">부족 역량 분석</TabsTrigger>
        </TabsList>

        {(["activity", "portfolio", "gap"] as AiMode[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-5">
            <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-black">
                    <CurrentIcon className="h-5 w-5 text-blue-600" />
                    {current.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={current.placeholder}
                    className="h-56 resize-none leading-6"
                  />
                  <Button onClick={handleGenerate} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        분석 중
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {current.button}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className={result ? "border-blue-200" : ""}>
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-lg font-black">
                    <Bot className="h-5 w-5 text-blue-600" />
                    AI 내비 결과
                  </CardTitle>
                </CardHeader>
                <CardContent className="min-h-[340px] p-5">
                  {loading ? (
                    <div className="space-y-4 py-8">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-blue-100" />
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                      <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                    </div>
                  ) : result ? (
                    <div className="max-h-[560px] overflow-y-auto rounded-lg border border-blue-100 bg-blue-50/60 p-5 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-800">
                      {result}
                    </div>
                  ) : (
                    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-slate-400">
                      <Sparkles className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-semibold">{current.empty}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
