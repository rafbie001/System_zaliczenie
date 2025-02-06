from flask import Blueprint, request, jsonify
import requests
import json

push_notifications = Blueprint('push_notifications', __name__)

# Na potrzeby przykładu użyjemy listy, w produkcji zapisz tokeny w bazie danych
registered_tokens = []

@push_notifications.route('/api/push-token', methods=['POST'])
def register_push_token():
    data = request.get_json()
    expo_push_token = data.get('expoPushToken')
    if expo_push_token:
        # Sprawdź, czy token już nie istnieje, aby nie zapisywać duplikatów
        if expo_push_token not in registered_tokens:
            registered_tokens.append(expo_push_token)
        return jsonify({"message": "Token zarejestrowany"}), 200
    else:
        return jsonify({"error": "Brak tokena"}), 400
def send_expo_push_notification(expo_push_token, title, body, data=None):
    """
    Wysyła powiadomienie push do zarejestrowanego tokena Expo.
    """
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
        print("Błąd wysyłki powiadomienia:", response.text)
    else:
        print("Powiadomienie wysłane:", response.json())
