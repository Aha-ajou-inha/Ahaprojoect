import { useState } from "react";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";

export function PortfolioFeedback() {
  const [portfolio, setPortfolio] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!portfolio.trim()) {
      alert("포트폴리오 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const data = await apiPost<{ generatedText: string }>("/api/ai/portfolio-feedback", { portfolio });
      setResult(data.generatedText);
    } catch (error) {
      console.error(error);
      alert("피드백 생성에 실패했습니다. 백엔드 서버와 Gemini API 키를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <Badge className="mb-3 bg-violet-50 text-violet-700 hover:bg-violet-50">
          AI 포트폴리오 피드백
        </Badge>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">이력서와 프로젝트 설명을 점검합니다</h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
          강점, 보완점, 바로 적용할 개선안을 분리해서 포트폴리오를 더 설득력 있게 다듬습니다.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <FileText className="h-5 w-5 text-violet-600" />
              포트폴리오 내용
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={portfolio}
              onChange={(event) => setPortfolio(event.target.value)}
              placeholder={`예:
- React 기반 교내 식단 리뷰 서비스 개발
- Zustand로 상태 관리, Tailwind CSS로 UI 구현
- 사용자 500명 테스트 완료
- Vercel 배포`}
              className="h-80 resize-none leading-6"
            />
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  점검 중
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  피드백 받기
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className={result ? "border-violet-200" : ""}>
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-black">피드백 리포트</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[500px] p-5">
            {loading ? (
              <div className="space-y-6 py-8">
                <div className="space-y-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-violet-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-violet-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ) : result ? (
              <div className="max-h-[680px] overflow-y-auto rounded-lg border border-violet-100 bg-violet-50/60 p-5 whitespace-pre-wrap text-sm font-medium leading-7 text-slate-800">
                {result}
              </div>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center text-slate-400">
                <Sparkles className="h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold">포트폴리오 내용을 입력하면 리포트가 여기에 표시됩니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
