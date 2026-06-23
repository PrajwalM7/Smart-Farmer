
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function AIFarmingAssistant() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/assistant/ask",
        {
          question,
        }
      );

      console.log("Assistant Response:", res.data);

      if (
        res.data &&
        res.data.data &&
        res.data.data.answer
      ) {
        setAnswer(res.data.data.answer);
      } else {
        setAnswer("No response received");
      }
    } catch (error) {
      console.error("Assistant Error:", error);

      if (error.response) {
        alert(
          error.response.data.message ||
            "Backend error occurred"
        );
      } else {
        alert("Failed to get response");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-page">
      <div className="assistant-card">
        <div className="assistant-header">
          <h1 className="assistant-title">
            🤖 AI Farming Assistant
          </h1>

          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
        </div>

        <p className="assistant-subtitle">
          Ask questions about crops, weather,
          fertilizers, irrigation, pests and farming.
        </p>

        <input
          type="text"
          className="assistant-input"
          placeholder="Ask farming question..."
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
        />

        <button
          className="ask-btn"
          onClick={askQuestion}
          disabled={loading}
        >
          {loading
            ? "Thinking..."
            : "Ask Question"}
        </button>

        {answer && (
          <div className="response-card">
            <h3>🌾 AI Response</h3>
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFarmingAssistant;

