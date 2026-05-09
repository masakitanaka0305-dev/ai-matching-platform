from __future__ import annotations
"""
メール通知サービス

スカウト着弾時にエンジニアへメール通知を送信する。
SMTP未設定時はログ出力のみ（開発環境対応）。
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from ..core.config import settings


class EmailService:
    def _send(self, to_email: str, subject: str, html_body: str) -> bool:
        """SMTP経由でメール送信。未設定時はログ出力のみ。"""
        if not settings.smtp_host or not settings.smtp_user:
            print(f"[Email] SMTP未設定 — To: {to_email} | Subject: {subject}")
            return False

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        try:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
                server.send_message(msg)
            print(f"[Email] Sent to {to_email}: {subject}")
            return True
        except Exception as e:
            print(f"[Email] Send error: {e}")
            return False

    def send_scout_notification(
        self,
        engineer_email: str,
        engineer_name: str,
        company_name: str,
        posting_title: str,
        message_preview: str,
        match_id: str,
    ) -> bool:
        """スカウト着弾通知をエンジニアに送信"""
        inbox_url = f"{settings.frontend_url}/engineer/inbox"
        subject = f"【AI Matching】{company_name}からスカウトが届きました"

        html = f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #4f46e5; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #fff; font-size: 20px; margin: 0;">AI Matching Platform</h1>
            </div>
            <div style="background: #fff; border: 1px solid #e5e7eb; padding: 24px; border-radius: 0 0 12px 12px;">
                <p style="color: #374151; font-size: 16px;">{engineer_name} 様</p>
                <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                    <strong>{company_name}</strong>から、以下のポジションについてスカウトが届きました。
                </p>
                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
                    <p style="font-weight: bold; color: #111827; margin: 0 0 4px;">{posting_title}</p>
                    <p style="color: #6b7280; font-size: 13px; margin: 0; white-space: pre-line;">{message_preview[:200]}{'...' if len(message_preview) > 200 else ''}</p>
                </div>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{inbox_url}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                        インボックスで確認する
                    </a>
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    このメールは AI Matching Platform から自動送信されています。
                </p>
            </div>
        </div>
        """
        return self._send(engineer_email, subject, html)

    def send_interview_notification(
        self,
        to_email: str,
        to_name: str,
        from_name: str,
        match_id: str,
        proposed_times: list[dict],
    ) -> bool:
        """面談日程提案の通知"""
        inbox_url = f"{settings.frontend_url}/engineer/inbox"
        subject = f"【AI Matching】{from_name}から面談日程の提案が届きました"

        times_html = ""
        for t in proposed_times[:5]:
            times_html += f'<li style="color: #374151; padding: 4px 0;">{t.get("datetime", "")}</li>'

        html = f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #4f46e5; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #fff; font-size: 20px; margin: 0;">AI Matching Platform</h1>
            </div>
            <div style="background: #fff; border: 1px solid #e5e7eb; padding: 24px; border-radius: 0 0 12px 12px;">
                <p style="color: #374151; font-size: 16px;">{to_name} 様</p>
                <p style="color: #374151; font-size: 14px;">
                    <strong>{from_name}</strong>から面談の日程候補が提案されました。
                </p>
                <ul style="background: #f9fafb; border-radius: 8px; padding: 16px 16px 16px 32px; margin: 16px 0;">
                    {times_html}
                </ul>
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{inbox_url}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                        日程を選択する
                    </a>
                </div>
            </div>
        </div>
        """
        return self._send(to_email, subject, html)

    def send_interview_confirmed(
        self,
        to_email: str,
        to_name: str,
        other_name: str,
        selected_time: str,
        meeting_url: Optional[str] = None,
    ) -> bool:
        """面談確定通知"""
        subject = f"【AI Matching】面談が確定しました — {selected_time}"
        meeting_info = f'<p style="margin-top: 8px;"><a href="{meeting_url}" style="color: #4f46e5;">ミーティングリンク</a></p>' if meeting_url else ""

        html = f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #059669; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #fff; font-size: 20px; margin: 0;">面談確定</h1>
            </div>
            <div style="background: #fff; border: 1px solid #e5e7eb; padding: 24px; border-radius: 0 0 12px 12px;">
                <p style="color: #374151;">{to_name} 様</p>
                <p style="color: #374151;"><strong>{other_name}</strong>との面談が確定しました。</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
                    <p style="font-size: 18px; font-weight: bold; color: #166534; margin: 0;">{selected_time}</p>
                    {meeting_info}
                </div>
            </div>
        </div>
        """
        return self._send(to_email, subject, html)


email_service = EmailService()
