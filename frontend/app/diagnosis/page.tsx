"use client";

import { useState } from "react";
import { diagnosisApi, paymentApi, type DiagnosisFreeReport } from "@/lib/api";

const QUESTIONS = [
  {
    id: "primary_domain",
    question: "あなたのAI専門領域は？",
    options: ["自然言語処理 (NLP)", "コンピュータビジョン", "LLM/生成AI", "MLOps/データ基盤", "推薦システム", "音声処理", "その他"],
  },
  {
    id: "experience_years",
    question: "AI/ML分野の実務経験は？",
    options: ["1年未満", "1-2年", "3-5年", "6-9年", "10年以上"],
  },
  {
    id: "recent_project",
    question: "直近1年で最も成果を出したプロジェクトの規模は？",
    options: ["個人・PoC", "チーム（3-5人）の本番導入", "部門横断プロジェクト", "全社基盤・プロダクトコア", "OSS / 論文発表あり"],
  },
  {
    id: "tech_depth",
    question: "技術スタックの深さは？",
    options: [
      "フレームワークを使って実装できる",
      "モデルのカスタマイズ・チューニングができる",
      "論文を読んで実装に落とせる",
      "独自アーキテクチャを設計できる",
    ],
  },
  {
    id: "leadership",
    question: "チームにおける役割は？",
    options: ["個人貢献者", "テックリード", "チームマネジメント兼務", "組織設計・採用にも関与"],
  },
];

export default function DiagnosisPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [diagnosisId, setDiagnosisId] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisFreeReport | null>(null);

  const current = QUESTIONS[step];
  const isComplete = step >= QUESTIONS.length;

  const handleSelect = async (option: string) => {
    const newAnswers = { ...answers, [current.id]: option };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      await submitDiagnosis(newAnswers);
    }
  };

  const submitDiagnosis = async (questionnaire: Record<string, string>) => {
    setLoading(true);
    setError("");
    try {
      // エンジニアIDがない場合はクライアントサイドフォールバック
      // 本来はログイン中のエンジニアIDを使う
      const engineerId = localStorage.getItem("engineer_id");
      if (engineerId) {
        const diag = await diagnosisApi.create(engineerId, questionnaire);
        setDiagnosisId(diag.id);
        const report = await diagnosisApi.freeReport(diag.id);
        setResult(report);
      } else {
        // バックエンドに登録がない場合はクライアントサイドで簡易計算
        setResult(generateLocalResult(questionnaire));
      }
    } catch {
      // API呼び出し失敗時もクライアントサイドフォールバック
      setResult(generateLocalResult(questionnaire));
    } finally {
      setLoading(false);
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
          ? "市場価値が高く、複数企業から引き合いが期待できます。"
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="text-xl font-bold mb-2">診断中...</div>
        <p className="text-gray-600">AIがあなたの市場価値を分析しています。</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">AI市場価値診断 結果</h1>

        <div className="bg-white p-8 rounded-xl border text-center">
          <div className="text-6xl font-bold text-indigo-600 mb-2">{result.score}</div>
          <div className="text-2xl font-bold mb-1">ランク {result.level}</div>
          <p className="text-gray-600">{result.summary}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border">
          <h3 className="font-bold mb-3">強み</h3>
          <ul className="space-y-1">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">&#10003;</span> {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
          <h3 className="font-bold mb-2">詳細レポートを受け取る</h3>
          <p className="text-sm text-gray-600 mb-4">
            GitHub分析・業界比較・年収推定を含む詳細レポートを生成します。
          </p>
          <button
            onClick={handlePurchaseReport}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            詳細レポートを購入（¥5,000）
          </button>
        </div>

        <div className="flex gap-4">
          <a
            href="/engineer"
            className="flex-1 text-center py-3 bg-indigo-600 text-white rounded-lg font-medium"
          >
            マッチングに登録する
          </a>
          <button
            onClick={() => {
              setStep(0);
              setAnswers({});
              setResult(null);
              setDiagnosisId(null);
            }}
            className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
          >
            もう一度診断する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">AI市場価値 無料診断</h1>
      <p className="text-gray-600 mb-8">5つの質問であなたのAI人材としての市場価値を診断します。</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}

      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-indigo-600" : "bg-gray-200"}`}
          />
        ))}
      </div>

      {!isComplete && (
        <div className="bg-white p-8 rounded-xl border">
          <div className="text-sm text-gray-500 mb-2">
            質問 {step + 1} / {QUESTIONS.length}
          </div>
          <h2 className="text-xl font-bold mb-6">{current.question}</h2>
          <div className="space-y-3">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition hover:border-indigo-400 hover:bg-indigo-50 ${
                  answers[current.id] === opt ? "border-indigo-600 bg-indigo-50" : ""
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
