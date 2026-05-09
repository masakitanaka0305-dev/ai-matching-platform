"use client";

import { useState } from "react";
import { diagnosisApi, paymentApi, type DiagnosisFreeReport } from "@/lib/api";

const QUESTIONS = [
  {
    id: "primary_domain",
    question: "あなたのAI専門領域は？",
    options: [
      { key: "A", label: "自然言語処理 (NLP)" },
      { key: "B", label: "コンピュータビジョン" },
      { key: "C", label: "LLM/生成AI" },
      { key: "D", label: "MLOps/データ基盤" },
      { key: "E", label: "推薦システム" },
      { key: "F", label: "音声処理" },
      { key: "G", label: "その他" },
    ],
  },
  {
    id: "experience_years",
    question: "AI/ML分野の実務経験は？",
    options: [
      { key: "A", label: "1年未満" },
      { key: "B", label: "1-2年" },
      { key: "C", label: "3-5年" },
      { key: "D", label: "6-9年" },
      { key: "E", label: "10年以上" },
    ],
  },
  {
    id: "recent_project",
    question: "直近1年で最も成果を出したプロジェクトの規模は？",
    options: [
      { key: "A", label: "個人・PoC" },
      { key: "B", label: "チーム（3-5人）の本番導入" },
      { key: "C", label: "部門横断プロジェクト" },
      { key: "D", label: "全社基盤・プロダクトコア" },
      { key: "E", label: "OSS / 論文発表あり" },
    ],
  },
  {
    id: "tech_depth",
    question: "技術スタックの深さは？",
    options: [
      { key: "A", label: "フレームワークを使って実装できる" },
      { key: "B", label: "モデルのカスタマイズ・チューニングができる" },
      { key: "C", label: "論文を読んで実装に落とせる" },
      { key: "D", label: "独自アーキテクチャを設計できる" },
    ],
  },
  {
    id: "leadership",
    question: "チームにおける役割は？",
    options: [
      { key: "A", label: "個人貢献者" },
      { key: "B", label: "テックリード" },
      { key: "C", label: "チームマネジメント兼務" },
      { key: "D", label: "組織設計・採用にも関与" },
    ],
  },
];

type Phase = "landing" | "quiz" | "result";

interface SkillScore {
  name: string;
  score: number;
  level: string;
  color: string;
}

interface ExtendedResult extends DiagnosisFreeReport {
  salaryRange: string;
  percentile: string;
  matchCount: number;
  skills: SkillScore[];
  improvements: string[];
  marketPosition: string;
}

export default function DiagnosisPage() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtendedResult | null>(null);

  const current = QUESTIONS[step];
  const progressPct = ((step + 1) / QUESTIONS.length) * 100;

  const handleSelect = async (label: string) => {
    const newAnswers = { ...answers, [current.id]: label };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      await submitDiagnosis(newAnswers);
    }
  };

  const submitDiagnosis = async (questionnaire: Record<string, string>) => {
    setLoading(true);
    try {
      const engineerId = localStorage.getItem("engineer_id");
      let baseResult: DiagnosisFreeReport;
      if (engineerId) {
        const diag = await diagnosisApi.create(engineerId, questionnaire);
        baseResult = await diagnosisApi.freeReport(diag.id);
      } else {
        baseResult = generateLocalResult(questionnaire);
      }
      setResult(enrichResult(baseResult, questionnaire));
    } catch {
      const base = generateLocalResult(questionnaire);
      setResult(enrichResult(base, questionnaire));
    } finally {
      setLoading(false);
      setPhase("result");
    }
  };

  const generateLocalResult = (ans: Record<string, string>): DiagnosisFreeReport => {
    let score = 50;
    const exp = ans.experience_years;
    if (exp === "3-5年") score += 10;
    if (exp === "6-9年") score += 20;
    if (exp === "10年以上") score += 30;
    if (ans.recent_project?.includes("全社")) score += 15;
    if (ans.recent_project?.includes("OSS")) score += 20;
    if (ans.recent_project?.includes("部門横断")) score += 10;
    if (ans.tech_depth?.includes("論文")) score += 15;
    if (ans.tech_depth?.includes("独自")) score += 20;
    if (ans.leadership?.includes("テックリード")) score += 10;
    if (ans.leadership?.includes("組織設計")) score += 15;
    score = Math.min(score, 99);
    const level = score >= 85 ? "S" : score >= 70 ? "A" : score >= 55 ? "B" : score >= 40 ? "C" : "D";
    return {
      score,
      level,
      summary:
        score >= 70
          ? "実装力と専門性を兼ね備えており、Tech Lead候補としての需要があります。"
          : score >= 50
            ? "着実にスキルを積んでおり、ステップアップのチャンスがあります。"
            : "基礎力はあります。専門性を深めることで市場価値が大きく向上します。",
      strengths: [
        ans.primary_domain,
        ans.tech_depth,
        ans.leadership !== "個人貢献者" ? `${ans.leadership}経験` : "",
      ].filter(Boolean),
    };
  };

  const enrichResult = (base: DiagnosisFreeReport, ans: Record<string, string>): ExtendedResult => {
    const s = base.score;
    const salaryRange =
      s >= 80 ? "900〜1,400万円" : s >= 65 ? "700〜1,000万円" : s >= 50 ? "500〜750万円" : "400〜600万円";
    const percentile =
      s >= 80 ? "上位15%" : s >= 65 ? "上位35%" : s >= 50 ? "上位55%" : "上位75%";
    const matchCount = s >= 80 ? 92 : s >= 65 ? 68 : s >= 50 ? 42 : 18;
    const levelLabel =
      s >= 80 ? "Senior-Lead Level" : s >= 65 ? "Mid-Senior Level" : s >= 50 ? "Mid Level" : "Junior-Mid Level";

    const domainMap: Record<string, number> = {
      "自然言語処理 (NLP)": 85, "コンピュータビジョン": 70, "LLM/生成AI": 90,
      "MLOps/データ基盤": 60, "推薦システム": 65, "音声処理": 55, "その他": 50,
    };
    const primaryScore = domainMap[ans.primary_domain] || 60;

    const skills: SkillScore[] = [
      { name: "NLP/LLM", score: ans.primary_domain?.includes("NLP") || ans.primary_domain?.includes("LLM") ? primaryScore : Math.max(35, primaryScore - 20), level: "", color: "" },
      { name: "PyTorch", score: Math.min(primaryScore - 5, 80), level: "", color: "" },
      { name: "モデルデプロイ", score: ans.tech_depth?.includes("独自") ? 75 : 70, level: "", color: "" },
      { name: "MLOps", score: ans.primary_domain?.includes("MLOps") ? 75 : 55, level: "", color: "" },
      { name: "データ基盤構築", score: s >= 60 ? 50 : 45, level: "", color: "" },
    ].map((sk) => ({
      ...sk,
      level: sk.score >= 75 ? "Advanced" : sk.score >= 60 ? "Intermediate" : sk.score >= 45 ? "Beginner-Mid" : "Beginner",
      color: sk.score >= 75 ? "bg-indigo-100 text-indigo-700" : sk.score >= 60 ? "bg-blue-100 text-blue-700" : sk.score >= 45 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600",
    }));

    const strengths = [
      `${ans.primary_domain}の実務経験`,
      "PyTorchでの本番環境構築スキル",
      "複数プロジェクトでのモデルデプロイ実績",
    ];
    const improvements = [
      "MLOps/インフラスキルの強化",
      "データ基盤構築の経験",
      "チームリード経験",
    ];

    return {
      ...base,
      summary: `市場スコア: ${levelLabel}`,
      salaryRange,
      percentile,
      matchCount,
      skills,
      strengths,
      improvements,
      marketPosition: levelLabel,
    };
  };

  const handlePurchaseReport = async () => {
    const engineerId = localStorage.getItem("engineer_id");
    if (!engineerId) {
      alert("エンジニア登録が必要です。先に登録してください。");
      return;
    }
    try {
      const { checkout_url } = await paymentApi.createDiagnosisCheckout(engineerId);
      window.location.href = checkout_url;
    } catch {
      alert("決済ページの生成に失敗しました。");
    }
  };

  const resetDiagnosis = () => {
    setPhase("landing");
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  /* ========== LANDING ========== */
  if (phase === "landing") {
    return (
      <div className="space-y-0">
        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-50 to-white py-14 sm:py-20 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
            AI/MLエンジニア<br />市場価値診断
          </h1>
        </section>

        {/* 診断で分かること */}
        <section className="max-w-3xl mx-auto px-4 -mt-6">
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-8">診断で分かること</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl shrink-0">
                  &#x2197;
                </div>
                <div>
                  <h4 className="font-bold mb-1">市場スコア</h4>
                  <p className="text-sm text-gray-600">あなたのスキルレベルを数値化。Junior/Mid/Senior/Expertのランク判定</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shrink-0">
                  &#x1F4CA;
                </div>
                <div>
                  <h4 className="font-bold mb-1">推定年収レンジ</h4>
                  <p className="text-sm text-gray-600">業界データに基づいた適正年収を算出（下限〜上限）</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl shrink-0">
                  &#10003;
                </div>
                <div>
                  <h4 className="font-bold mb-1">技術的強み分析</h4>
                  <p className="text-sm text-gray-600">どの技術領域・フレームワークで市場価値が高いか可視化</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center text-xl shrink-0">
                  &#x1F3AF;
                </div>
                <div>
                  <h4 className="font-bold mb-1">キャリアアドバイス</h4>
                  <p className="text-sm text-gray-600">次のステップに進むために習得すべきスキルを提案</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 stats */}
        <section className="max-w-3xl mx-auto px-4 py-10">
          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-xl p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">5分</div>
              <div className="text-sm text-gray-500 mt-1">所要時間</div>
            </div>
            <div className="border rounded-xl p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">完全無料</div>
              <div className="text-sm text-gray-500 mt-1">登録不要</div>
            </div>
            <div className="border rounded-xl p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-indigo-600">即時結果</div>
              <div className="text-sm text-gray-500 mt-1">すぐに確認</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center pb-14 px-4">
          <button
            onClick={() => setPhase("quiz")}
            className="px-12 sm:px-16 py-4 sm:py-5 bg-indigo-600 text-white rounded-xl text-lg sm:text-xl font-bold hover:bg-indigo-700 transition"
          >
            診断を開始する
          </button>
          <p className="text-sm text-gray-400 mt-4">※個人情報の入力は不要です</p>
        </section>
      </div>
    );
  }

  /* ========== QUIZ ========== */
  if (phase === "quiz") {
    if (loading) {
      return (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="text-xl font-bold mb-2">診断中...</div>
          <p className="text-gray-600">AIがあなたの市場価値を分析しています。</p>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-indigo-600 font-medium">
            質問 {step + 1} / {QUESTIONS.length}
          </span>
          <span className="text-sm text-indigo-600 font-medium">
            {Math.round(progressPct)}% 完了
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-10">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl border p-6 sm:p-10">
          <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8">{current.question}</h2>
          <div className="space-y-3">
            {current.options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleSelect(opt.label)}
                className={`w-full flex items-center gap-4 text-left px-5 py-4 rounded-xl border transition hover:border-indigo-400 hover:bg-indigo-50 ${
                  answers[current.id] === opt.label ? "border-indigo-600 bg-indigo-50" : ""
                }`}
              >
                <span className="text-gray-400 font-bold text-sm shrink-0">{opt.key}.</span>
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ========== RESULT ========== */
  if (phase === "result" && result) {
    const marketTiers = [
      { label: "Junior (0-2年)", salary: "400〜600万円", pct: 20, active: result.score < 50 },
      { label: "Mid (3-5年)", salary: "600〜900万円", pct: 45, active: result.score >= 50 && result.score < 65 },
      { label: "Senior (6-9年)", salary: "900〜1,400万円", pct: 25, active: result.score >= 65 && result.score < 85 },
      { label: "論文実装・OSS貢献", salary: "", pct: 10, active: result.score >= 85 },
    ];

    const matchCategories = [
      { name: "LLMスタートアップ", count: 23, highlight: true },
      { name: "大手テック企業", count: 15, highlight: false },
      { name: "AI研究開発企業", count: 12, highlight: true },
      { name: "事業会社AI部門", count: 18, highlight: false },
    ];

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-6">
        <div className="text-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">市場価値診断結果</h1>
          <p className="text-sm text-gray-500">あなたのAI/MLエンジニアとしての市場価値を分析しました</p>
        </div>

        {/* Score Hero */}
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-700 rounded-2xl p-8 sm:p-10 text-center text-white">
          <div className="text-6xl sm:text-8xl font-bold mb-2">{result.score}</div>
          <div className="text-lg sm:text-xl font-bold mb-2">{result.summary}</div>
          <p className="text-indigo-200 text-sm">
            実装力と専門性を兼ね備えており、Tech Lead候補としての需要があります。
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-indigo-500">
            <div>
              <div className="text-xl sm:text-2xl font-bold">{result.salaryRange}</div>
              <div className="text-xs text-indigo-200 mt-1">推定年収レンジ</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold">{result.percentile}</div>
              <div className="text-xs text-indigo-200 mt-1">AI/ML市場での位置</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold">{result.matchCount}社</div>
              <div className="text-xs text-indigo-200 mt-1">マッチング可能企業</div>
            </div>
          </div>
        </div>

        {/* スキル別評価 */}
        <div className="bg-white rounded-2xl border p-6 sm:p-8">
          <h3 className="text-lg font-bold mb-1">スキル別評価</h3>
          <p className="text-sm text-gray-500 mb-6">各技術領域でのあなたの習熟度を可視化</p>
          <div className="space-y-4">
            {result.skills.map((sk) => (
              <div key={sk.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{sk.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${sk.color}`}>{sk.level}</span>
                  </div>
                  <span className="text-sm font-bold">{sk.score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-gray-800 h-2.5 rounded-full" style={{ width: `${sk.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 強み & 改善 */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border p-5">
            {result.strengths.map((s, i) => (
              <div key={i} className="flex gap-3 mb-3 last:mb-0">
                <span className="text-green-500 mt-0.5">&#9733;</span>
                <div>
                  <div className="text-sm font-bold">{s}</div>
                  <div className="text-xs text-gray-500">需要の高い領域での専門性が評価されています</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border p-5">
            {result.improvements.map((s, i) => (
              <div key={i} className="flex gap-3 mb-3 last:mb-0">
                <span className="text-orange-500 mt-0.5">&#x2197;</span>
                <div>
                  <div className="text-sm font-bold">{s}</div>
                  <div className="text-xs text-gray-500">経験を積むと市場価値がさらに向上</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI/ML市場でのポジション */}
        <div className="bg-white rounded-2xl border p-6 sm:p-8">
          <h3 className="text-lg font-bold mb-1">AI/ML市場でのポジション</h3>
          <p className="text-sm text-gray-500 mb-6">他のエンジニアと比較したあなたの立ち位置</p>
          <div className="space-y-3">
            {marketTiers.map((tier) => (
              <div
                key={tier.label}
                className={`p-4 rounded-xl border-2 ${tier.active ? "border-indigo-600 bg-indigo-50" : "border-gray-100 bg-white"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{tier.label}</span>
                    {tier.active && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">あなたはここ</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{tier.pct}%<span className="text-xs ml-1">市場割合</span></span>
                </div>
                {tier.salary && <div className="text-xs text-gray-500">{tier.salary}</div>}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className={`h-2 rounded-full ${tier.active ? "bg-indigo-600" : "bg-gray-400"}`} style={{ width: `${tier.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            チームリードやテックリードとしての経験を積むことで、Tech Lead/EMポジションへの道が開けます
          </p>
        </div>

        {/* マッチング可能な企業 */}
        <div className="bg-white rounded-2xl border p-6 sm:p-8">
          <h3 className="text-lg font-bold mb-1">マッチング可能な企業</h3>
          <p className="text-sm text-gray-500 mb-6">あなたのスキルセットに興味を持つ企業の分布</p>
          <div className="grid grid-cols-2 gap-3">
            {matchCategories.map((cat) => (
              <div key={cat.name} className="border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold">{cat.name}</div>
                  {cat.highlight && (
                    <span className="text-xs text-green-600">●高マッチング率</span>
                  )}
                </div>
                <span className="text-2xl font-bold text-indigo-600">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 有料レポート CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-center text-white">
          <h3 className="text-lg font-bold mb-2">さらに詳細な分析が必要ですか？</h3>
          <p className="text-sm text-indigo-200 mb-6">
            GitHub活動の詳細分析・類似プロフィールとの比較・具体的な企業推薦を含む<br />
            30ページ超の詳細レポートをご提供します
          </p>
          <div className="flex justify-center gap-4 mb-6">
            {["GitHubコード分析", "具体的企業マッチング", "1on1キャリア相談"].map((item) => (
              <span key={item} className="text-xs bg-white/20 rounded-full px-3 py-1.5">{item}</span>
            ))}
          </div>
          <button
            onClick={handlePurchaseReport}
            className="px-8 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition"
          >
            詳細レポートを取得（¥5,000）
          </button>
          <p className="text-xs text-indigo-300 mt-3">※ 30日間返金保証付き</p>
        </div>

        {/* Bottom CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href="/engineer"
            className="flex-1 text-center py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            マッチングに登録する →
          </a>
          <button
            onClick={resetDiagnosis}
            className="flex-1 py-3.5 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            もう一度診断する
          </button>
        </div>
      </div>
    );
  }

  return null;
}
