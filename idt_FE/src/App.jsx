import { useState } from "react";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    const res = await fetch("https://bitespeed-backend-task-identity-reconciliation-production-6727.up.railway.app/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, phoneNumber })
    });

    const data = await res.json();
    setResult(data);
  }

  return (
    <div className="container">
      <div className="form-box">
      <h2>Identity Matching</h2>

      <input
        placeholder="Enter Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        placeholder="Enter Phone Number"
        value={phoneNumber}
        onChange={e => setPhoneNumber(e.target.value)}
      />

      <button onClick={handleSubmit}>Submit</button>

      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
      </div>
    </div>
  );
}

export default App;