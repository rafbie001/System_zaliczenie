import requests
import json
from flask import Blueprint, request, jsonify

push_notifications_bp = Blueprint('push_notifications', __name__)

# Lista przechowująca tokeny push (można zamienić na bazę danych)
registered_tokens = []


@push_notifications_bp.route('/api/push-token', methods=['POST'])
def register_push_token():
    data = request.get_json()
    expo_push_token = data.get('expoPushToken')

    if expo_push_token:
        if expo_push_token not in registered_tokens:
            registered_tokens.append(expo_push_token)
        return jsonify({"message": "Token zarejestrowany"}), 200
    return jsonify({"error": "Brak tokena"}), 400


def send_expo_push_notification(expo_push_token, title, body, data=None):
    if data is None:
        data = {}

    message = {
        "to": expo_push_token,
        "title": title,
        "body": body,
        "data": data
    }

    response = requests.post(
        "https://exp.host/--/api/v2/push/send",
        data=json.dumps(message),
        headers={"Content-Type": "application/json"}
    )

    if response.status_code != 200:
        print("Błąd wysyłania powiadomienia:", response.text)
    else:
        print("Powiadomienie wysłane:", response.json())
