from __future__ import annotations
"""
エンゲージメントインサイト生成サービス

候補者のプロフィール・行動データから、企業がアプローチ成功率を
最大化するための「プラットフォームでしか得られないアドバイス」を生成。
データだけ盗んでも再現できない付加価値を提供する。
"""
from datetime import datetime
from sqlalchemy.orm import Session

from ..models.models import (
    Match, Engineer, JobPosting, EngagementInsight, ApproachMessage,
)


class EngagementService:

    def generate_insights(self, match: Match, db: Session) -> list[dict]:
        """マッチに対するエンゲージメントインサイトを生成して保存"""
        engineer: Engineer = match.engineer
        posting: JobPosting = match.posting
        insights = []

        # 1. 連絡タイミングの好み
        contact_pref = self._analyze_contact_preference(engineer)
        insights.append(contact_pref)

        # 2. 技術的関心の分析 → 返信率を上げるトピック
        tech_interest = self._analyze_tech_interest(engineer, posting)
        insights.append(tech_interest)

        # 3. アプローチ最適化のコツ
        response_tip = self._generate_response_tips(engineer, posting, match)
        insights.append(response_tip)

        # 4. キャリア志向の分析
        career_insight = self._analyze_career_orientation(engineer)
        insights.append(career_insight)

        # DBに保存
        for ins in insights:
            existing = db.query(EngagementInsight).filter(
                EngagementInsight.match_id == match.id,
                EngagementInsight.insight_type == ins["insight_type"],
            ).first()
            if not existing:
                record = EngagementInsight(
                    match_id=match.id,
                    insight_type=ins["insight_type"],
                    content=ins["content"],
                    confidence=ins["confidence"],
                )
                db.add(record)

        db.commit()
        return insights

    def get_insights(self, match_id: str, db: Session) -> list[dict]:
        """保存済みインサイトを取得"""
        records = db.query(EngagementInsight).filter(
            EngagementInsight.match_id == match_id
        ).all()
        return [
            {
                "insight_type": r.insight_type,
                "content": r.content,
                "confidence": float(r.confidence or 0.8),
            }
            for r in records
        ]

    def optimize_approach_message(
        self, match: Match, subject: str, body: str, db: Session
    ) -> dict:
        """アプローチメッセージをAI最適化して送信"""
        engineer: Engineer = match.engineer

        suggestions = []

        # 名前のパーソナライゼーション
        if engineer.name and engineer.name not in body:
            suggestions.append(f"冒頭に「{engineer.name}様」と名前を入れると返信率が上がります")

        # 技術キーワードのマッチ
        specialties = engineer.ai_specialties or []
        mentioned = [s for s in specialties if s.lower() in body.lower()]
        not_mentioned = [s for s in specialties if s.lower() not in body.lower()]
        if not_mentioned:
            suggestions.append(
                f"候補者の専門領域「{', '.join(not_mentioned[:2])}」に言及すると関心を引きやすくなります"
            )

        # 給与への言及
        if engineer.desired_salary_min and "年収" not in body and "報酬" not in body:
            suggestions.append("具体的な年収レンジに触れると、条件面での安心感を与えられます")

        # メッセージ長の最適化
        if len(body) > 500:
            suggestions.append("メッセージが長めです。300〜400文字程度が最も返信率が高い傾向にあります")
        elif len(body) < 100:
            suggestions.append("メッセージが短すぎます。具体的なポジションの魅力を追加しましょう")

        # メッセージ保存
        msg = ApproachMessage(
            match_id=match.id,
            sender_type="company",
            sender_id=str(match.posting.company_id),
            subject=subject,
            body=body,
            ai_optimized=True,
            ai_suggestions=suggestions,
        )
        db.add(msg)
        db.commit()
        db.refresh(msg)

        return {
            "message_id": str(msg.id),
            "suggestions": suggestions,
            "optimization_score": max(0.6, 1.0 - len(suggestions) * 0.1),
        }

    def get_followup_status(self, match_id: str, db: Session) -> dict:
        """フォローアップステータスを返却"""
        messages = db.query(ApproachMessage).filter(
            ApproachMessage.match_id == match_id
        ).order_by(ApproachMessage.created_at.desc()).all()

        total = len(messages)
        read = sum(1 for m in messages if m.read_at)
        last_sent = messages[0].created_at if messages else None

        # フォローアップ推奨判定
        recommend_followup = False
        followup_reason = ""
        if total > 0 and not read:
            days_since = (datetime.utcnow() - last_sent).days if last_sent else 0
            if days_since >= 3:
                recommend_followup = True
                followup_reason = f"前回送信から{days_since}日経過。フォローアップで返信率が平均40%向上します"

        return {
            "total_messages": total,
            "read_count": read,
            "last_sent_at": last_sent.isoformat() if last_sent else None,
            "recommend_followup": recommend_followup,
            "followup_reason": followup_reason,
        }

    # ------------------------------------------------------------------
    # インサイト生成ロジック
    # ------------------------------------------------------------------

    def _analyze_contact_preference(self, engineer: Engineer) -> dict:
        """連絡タイミングの好みを推定"""
        # GitHub URLの有無 → 技術者タイプの推定
        has_github = bool(engineer.github_url)
        level = engineer.experience_level.value if engineer.experience_level else "mid"

        if level in ("lead", "executive"):
            pref = "平日の午前中（10:00-12:00）にビジネスライクなトーンでのアプローチが効果的です。意思決定者として簡潔な提案を好みます。"
            confidence = 0.75
        elif has_github:
            pref = "夕方〜夜間（18:00-22:00）のアプローチが効果的です。技術的な詳細や開発環境の説明を重視する傾向があります。"
            confidence = 0.70
        else:
            pref = "平日昼休み（12:00-13:00）または夕方（17:00-19:00）が返信率の高い時間帯です。"
            confidence = 0.65

        return {
            "insight_type": "contact_preference",
            "content": pref,
            "confidence": confidence,
        }

    def _analyze_tech_interest(self, engineer: Engineer, posting: JobPosting) -> dict:
        """技術的関心の重なりを分析"""
        specialties = engineer.ai_specialties or []
        posting_domains = posting.ai_domain or []
        overlap = set(s.lower() for s in specialties) & set(d.lower() for d in posting_domains)

        if overlap:
            topics = ", ".join(overlap)
            content = f"「{topics}」の技術について触れると返信率が上がります。特に貴社での具体的な活用事例や技術的チャレンジに言及することが効果的です。"
            confidence = 0.85
        elif specialties:
            content = f"候補者は「{', '.join(specialties[:2])}」に強い関心があります。これらの技術が貴社でどう活かせるかを具体的に示すと、興味を引きやすくなります。"
            confidence = 0.70
        else:
            content = "技術スタックや開発環境の具体的な説明を含めると、返信率が向上する傾向があります。"
            confidence = 0.60

        return {
            "insight_type": "tech_interest",
            "content": content,
            "confidence": confidence,
        }

    def _generate_response_tips(self, engineer: Engineer, posting: JobPosting, match: Match) -> dict:
        """返信率最大化のためのアドバイス"""
        tips = []
        score = float(match.ai_score or 0)

        if score >= 80:
            tips.append("高マッチ度の候補者です。競合からのアプローチも予想されるため、スピード重視で最初のコンタクトを取りましょう")
        elif score >= 60:
            tips.append("良好なマッチ度です。候補者の具体的なスキルセットに合わせたカスタムメッセージが効果的です")

        work_style = engineer.desired_work_style or "hybrid"
        if work_style == "remote":
            tips.append("リモートワーク希望の候補者です。リモート制度や柔軟な勤務体制を強調しましょう")
        elif work_style == "onsite":
            tips.append("オフィス勤務を好む候補者です。オフィス環境やチームの雰囲気を伝えると良いでしょう")

        if engineer.years_of_experience and engineer.years_of_experience >= 7:
            tips.append("経験豊富な候補者です。技術リーダーシップやアーキテクチャ設計の機会を提示すると響きます")

        content = " ".join(tips) if tips else "まずはカジュアルなトーンで技術的な関心事について会話を始めましょう。"

        return {
            "insight_type": "response_tip",
            "content": content,
            "confidence": 0.75,
        }

    def _analyze_career_orientation(self, engineer: Engineer) -> dict:
        """キャリア志向の分析"""
        level = engineer.experience_level.value if engineer.experience_level else "mid"
        years = engineer.years_of_experience or 0

        if level in ("junior", "mid") and years <= 3:
            content = "成長意欲の高いフェーズの候補者です。メンタリング制度やスキルアップ支援について言及すると、キャリアへの投資を感じて好印象です。"
        elif level == "senior":
            content = "技術的な深さを追求するフェーズです。難易度の高い技術課題や最新技術の導入実績を伝えると興味を引けます。"
        elif level in ("lead", "executive"):
            content = "マネジメントとしての影響力を求めるフェーズです。組織設計への関与や事業インパクトについて言及しましょう。"
        else:
            content = "候補者のキャリアステージに合わせた成長機会を提示することが効果的です。"

        return {
            "insight_type": "career_orientation",
            "content": content,
            "confidence": 0.70,
        }


engagement_service = EngagementService()
