import os
from twilio.rest import Client

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")
messaging_service_sid = os.getenv("TWILIO_MESSAGING_SERVICE_SID")

client = Client(account_sid, auth_token)

def send_alert(to_number: str, message: str):
    """
    Send an SMS alert via Twilio Messaging Service
    """
    try:
        msg = client.messages.create(
            messaging_service_sid=messaging_service_sid,
            to=to_number,
            body=message
        )
        print(f"✅ SMS sent successfully: SID={msg.sid}")
        return msg.sid
    except Exception as e:
        print(f"❌ Failed to send SMS: {str(e)}")
        return None
