"use client";

import { useState } from "react";

export default function Page() {
  const [vehicle, setVehicle] = useState({
    year: 2020,
    make: "Toyota",
    model: "Camry",
    mileage: 90000,
  });

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setAnswer("");
    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicle, question }),
    });
    const data = await res.json();
    setAnswer(data.answer || "Error");
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto" }}>
      <h1>AI Car Ownership Assistant</h1>

      <input
        placeholder="Year"
        value={vehicle.year}
        onChange={(e) =>
          setVehicle({ ...vehicle, year: Number(e.target.value) })
        }
      />

      <input
        placeholder="Make"
        value={vehicle.make}
        onChange={(e) =>
          setVehicle({ ...vehicle, make: e.target.value })
        }
      />

      <input
        placeholder="Model"
        value={vehicle.model}
        onChange={(e) =>
          setVehicle({ ...vehicle, model: e.target.value })
        }
      />

      <input
        placeholder="Mileage"
        value={vehicle.mileage}
        onChange={(e) =>
          setVehicle({ ...vehicle, mileage: Number(e.target.value) })
        }
      />

      <textarea
        placeholder="Ask about maintenance or repairs..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button onClick={submit} disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </button>

      <pre>{answer}</pre>
    </main>
  );
}
