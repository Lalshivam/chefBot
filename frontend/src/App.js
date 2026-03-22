import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input) return;

    // Show user message
    setMessages([...messages, { sender: "user", text: input }]);

    try {
      const res = await axios.post("http://localhost:8000/chat", { message: input });
      setMessages(prev => [...prev, { sender: "bot", text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: "Error: Could not get response" }]);
    }

    setInput("");
  };

  return (
    <div className="chat-container">
      <h1>Qwen2.5 Chatbot</h1>
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === "user" ? "user-msg" : "bot-msg"}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
