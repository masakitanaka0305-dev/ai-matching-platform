from __future__ import annotations
"""
Knowledge-Loop：失注データ学習サービス

match_events の rejection_reason を集計し、
日本企業特有の懸念点パターンを抽出 → スコアリング重みを自動調整する。

分析対象:
  - rejected / withdrawn のマッチイベント
  - rejection_reason テキスト
  - 企業属性（業種、規模）
  - エンジニア属性（レベル、専門領域）

出力:
  - 懸念点パターン辞書（頻出ワード + 出現率）
  - 企業業種別の拒否傾向
  - スコアリング重み調整提案
  - 切り返しトーク自動生成（テンプレート版）
"""
from collections import Counter
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models.models import (
    Match, MatchEvent, MatchStatus, Company, JobPosting, Engineer,
)


# ---------------------------------------------------------------------------
# 日本企業特有の懸念点キーワード辞書
# ---------------------------------------------------------------------------
CONCERN_KEYWORDS = {
    "年齢": "age_concern",
    "経験不足": "experience_gap",
    "転職回数": "job_hopping",
    "リモート": "remote_resistance",
    "フリーランス": "freelance_bias",
    "外国籍": "nationality_concern",
    "給与": "salary_mismatch",
    "年収": "salary_mismatch",
    "カルチャー": "culture_fit",
    "社風": "culture_fit",
    "マネジメント": "management_expectation",
    "即戦力": "immediate_contribution",
    "稟議": "approval_process",
    "承認": "approval_process",
    "予算": "budget_constraint",
    "スキル不足": "skill_gap",
    "オーバースペック": "overqualified",
    "コミュニケーション": "communication_concern",
}


class KnowledgeLoop:

    def analyze_rejections(
        self, db: Session, days: int = 90
    ) -> dict:
        """過去N日間の失注データを分析"""
        cutoff = datetime.utcnow() - timedelta(days=days)

        # rejected / withdrawn のマッチを取得
        lost_matches = (
            db.query(Match)
            .filter(
                Match.status.in_([MatchStatus.rejected, MatchStatus.withdrawn]),
                Match.resolved_at >= cutoff,
            )
            .all()
        )

        if not lost_matches:
            return {
                "period_days": days,
                "total_lost": 0,
                "patterns": [],
                "weight_adjustments": {},
                "counter_talk_suggestions": [],
            }

        # 懸念点パターン抽出
        concern_counter = Counter()
        industry_rejection = Counter()
        level_rejection = Counter()
        reasons = []

        for m in lost_matches:
            reason = m.rejection_reason or ""
            reasons.append(reason)

            # キーワードマッチング
            for keyword, category in CONCERN_KEYWORDS.items():
                if keyword in reason:
                    concern_counter[category] += 1

            # 企業業種別集計
            posting = db.query(JobPosting).filter(JobPosting.id == m.posting_id).first()
            if posting:
                company = db.query(Company).filter(Company.id == posting.company_id).first()
                if company and company.industry:
                    industry_rejection[company.industry] += 1

            # エンジニアレベル別集計
            engineer = db.query(Engineer).filter(Engineer.id == m.engineer_id).first()
            if engineer:
                level_rejection[engineer.experience_level.value] += 1

        total = len(lost_matches)

        # パターンランキング
        patterns = [
            {
                "category": cat,
                "count": count,
                "rate": round(count / total * 100, 1),
                "label": self._category_label(cat),
            }
            for cat, count in concern_counter.most_common(10)
        ]

        # 重み調整提案
        weight_adjustments = self._suggest_weight_adjustments(concern_counter, total)

        # 切り返しトーク生成
        counter_talks = self._generate_counter_talks(patterns[:5])

        return {
            "period_days": days,
            "total_lost": total,
            "patterns": patterns,
            "industry_breakdown": dict(industry_rejection.most_common()),
            "level_breakdown": dict(level_rejection.most_common()),
            "weight_adjustments": weight_adjustments,
            "counter_talk_suggestions": counter_talks,
            "analyzed_at": datetime.utcnow().isoformat(),
        }

    def _category_label(self, cat: str) -> str:
        labels = {
            "age_concern": "年齢への懸念",
            "experience_gap": "経験不足",
            "job_hopping": "転職回数への懸念",
            "remote_resistance": "リモートワークへの抵抗",
            "freelance_bias": "フリーランス経歴への偏見",
            "nationality_concern": "国籍への懸念",
            "salary_mismatch": "給与レンジの不一致",
            "culture_fit": "カルチャーフィット懸念",
            "management_expectation": "マネジメント経験への期待",
            "immediate_contribution": "即戦力期待とのギャップ",
            "approval_process": "社内稟議プロセスの長期化",
            "budget_constraint": "予算制約",
            "skill_gap": "スキルギャップ",
            "overqualified": "オーバースペック（逆に不安）",
            "communication_concern": "コミュニケーション懸念",
        }
        return labels.get(cat, cat)

    def _suggest_weight_adjustments(self, concerns: Counter, total: int) -> dict:
        """懸念点パターンからスコアリング重みの調整を提案"""
        adjustments = {}

        if concerns.get("salary_mismatch", 0) / max(total, 1) > 0.3:
            adjustments["salary_fit"] = {
                "current": 15,
                "suggested": 20,
                "reason": "給与ミスマッチによる失注が30%超。給与適合度の重みを引き上げ推奨。",
            }

        if concerns.get("culture_fit", 0) / max(total, 1) > 0.2:
            adjustments["culture_fit"] = {
                "current": 5,
                "suggested": 12,
                "reason": "カルチャーフィット懸念が20%超。企業文化適合スコアの導入を推奨。",
            }

        if concerns.get("experience_gap", 0) / max(total, 1) > 0.25:
            adjustments["experience_level"] = {
                "current": 20,
                "suggested": 25,
                "reason": "経験不足による失注が25%超。経験レベルの重み引き上げ推奨。",
            }

        if concerns.get("remote_resistance", 0) / max(total, 1) > 0.2:
            adjustments["work_style"] = {
                "current": 10,
                "suggested": 15,
                "reason": "リモート勤務への抵抗が20%超。勤務形態一致の重み引き上げ推奨。",
            }

        return adjustments

    def _generate_counter_talks(self, top_patterns: list) -> list:
        """失注パターン上位に対する切り返しトーク生成"""
        talk_templates = {
            "salary_mismatch": {
                "concern": "提示年収が候補者の希望と合わない",
                "talk": "年収レンジについてですが、当該候補者は{role}として{years}年の実績があり、"
                        "直近のプロジェクトでは{achievement}の成果を上げています。"
                        "市場相場（{market_range}万円）を踏まえると、投資対効果は十分に見合うと考えます。"
                        "また、入社後のパフォーマンス次第でレンジ見直しのオプションもご検討いただけないでしょうか。",
            },
            "experience_gap": {
                "concern": "求めるレベルに経験が足りない",
                "talk": "経験年数は確かに{years}年ですが、{specialty}領域では密度の高い実務経験を積んでおり、"
                        "特に{highlight}については即戦力レベルです。"
                        "また、学習速度が非常に速く、過去に{learning_example}を短期間で習得した実績があります。",
            },
            "culture_fit": {
                "concern": "社風や働き方が合わなそう",
                "talk": "カルチャーフィットに関するご懸念、承知しました。"
                        "候補者の過去の職場環境は{prev_env}で、御社と類似した{similarity}の文化です。"
                        "カジュアル面談で相互理解を深めていただくことをお勧めします。リスクなく確認できます。",
            },
            "remote_resistance": {
                "concern": "リモートワーク希望だが、出社を求めたい",
                "talk": "勤務形態について、候補者はハイブリッド勤務にも柔軟に対応可能です。"
                        "週{days}日の出社であれば問題ないとのことです。"
                        "まずはトライアル期間で最適な頻度を一緒に見つけていく形はいかがでしょうか。",
            },
            "approval_process": {
                "concern": "社内稟議に時間がかかる",
                "talk": "稟議プロセスについて、お忙しい中恐縮ですが、"
                        "当該候補者は他社からも並行してオファーを受けている状況です。"
                        "稟議用の資料（候補者サマリー・ROI試算・類似採用事例）をこちらで作成いたしますので、"
                        "ご担当者様のご負担を最小限にいたします。",
            },
            "overqualified": {
                "concern": "候補者のスペックが高すぎて定着しないのでは",
                "talk": "オーバースペックのご懸念は非常にごもっともです。"
                        "候補者に確認したところ、御社の{appeal}に強い関心を示しており、"
                        "特に{specific_interest}の領域で長期的にコミットしたいとのことです。"
                        "成長フェーズの企業でリーダーシップを発揮したいという動機は、定着率にプラスに働きます。",
            },
        }

        suggestions = []
        for pattern in top_patterns:
            cat = pattern["category"]
            if cat in talk_templates:
                template = talk_templates[cat]
                suggestions.append({
                    "concern_category": cat,
                    "concern_label": pattern["label"],
                    "frequency_rate": pattern["rate"],
                    "concern_description": template["concern"],
                    "counter_talk_template": template["talk"],
                    "usage_note": "{}内は候補者情報に応じて置換してください",
                })

        return suggestions


knowledge_loop = KnowledgeLoop()
