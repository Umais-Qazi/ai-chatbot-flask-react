import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI, AzureOpenAI

load_dotenv()

USE_AZURE = bool(os.getenv("AZURE_OPENAI_ENDPOINT"))

if USE_AZURE:
    client = AzureOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-08-01-preview"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    )
    MODEL = os.getenv("AZURE_OPENAI_DEPLOYMENT")  # your Azure deployment name
else:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

app = Flask(__name__)
CORS(app)

@app.route("/api/health", methods=["GET"])
def health():
    return {"status": "ok"}

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = (data.get("message") or "").strip()
    if not user_message:
        return jsonify({"error": "message is required"}), 400
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a concise, friendly assistant."},
                {"role": "user", "content": user_message},
            ],
            temperature=0.5,
        )
        reply = completion.choices[0].message.content
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
