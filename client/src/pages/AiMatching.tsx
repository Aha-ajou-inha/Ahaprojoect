import { useState } from "react";
import { Bot, Loader2, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";

export function AiMatching() {
  const [spec, setSpec] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!spec.trim()) {
      alert("스펙과 목표를 입력해주세요.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const data = await apiPost<{ generatedText: string }>("/api/ai/activity-match", { spec });
      setResult(data.generatedText);
    } catch (error) {
      console.error(error);
      alert("활동 추천에 실패했습니다. 백엔드 서버와 Gemini API 키를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Badge className="mb-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
          AI 활동 추천
        </Badge>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">내 스펙에 맞는 다음 활동을 찾습니다</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
          현재 경험과 목표 직무를 입력하면 부족한 역량을 채울 수 있는 공모전, 스터디, 대외활동을 추천합니다.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Target className="h-5 w-5 text-emerald-600" />
              스펙 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={spec}
              onChange={(event) => setSpec(event.target.value)}
              placeholder="예: 컴퓨터공학 3학년, 프론트엔드 취업 목표, React와 TypeScript 프로젝트 1회 경험, 팀 리딩 경험 부족"
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
                  활동 추천 받기
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className={result ? "border-emerald-200" : ""}>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Bot className="h-5 w-5 text-emerald-600" />
              추천 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[340px] p-5">
            {loading ? (
              <div className="space-y-4 py-8">
                <div className="h-4 w-2/3 animate-pulse rounded bg-emerald-100" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
              </div>
            ) : result ? (
              <div className="max-h-[560px] overflow-y-auto rounded-lg border border-emerald-100 bg-emerald-50/60 p-5 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-800">
                {result}
              </div>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-center text-slate-400">
                <Sparkles className="h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold">스펙을 입력하면 추천 결과가 여기에 표시됩니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
