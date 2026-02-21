import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY


def send_confirmation_email(to: str, token: str):
    confirm_url = f"{settings.FRONTEND_URL}/confirm?token={token}"
    resend.Emails.send(
        {
            # "from": "noreply@домен.com", TODO
            "from": "onboarding@resend.dev",
            "to": to,
            "subject": "Підтвердження реєстрації",
            "html": f"""
            <h2>Вітаємо!</h2>
            <p>Для підтвердження email перейдіть за посиланням:</p>
            <a href="{confirm_url}">Підтвердити email</a>
        """,
        }
    )
