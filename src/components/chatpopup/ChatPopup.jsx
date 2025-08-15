import { useState } from "react";
import "./chatPopup.css";

export default function ChatPopup({ onClose }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "Shirley", text: "Hey there!" },
    { sender: "You", text: "Hello 😊" },
  ]);

  const handleSend = () => {
    if (input.trim() === "") return;

    setMessages([...messages, { sender: "You", text: input }]);
    setInput(""); // clear input
  };

  return (
    <div className="chatPopup">
      <div className="chatHeader">
        <span>Chat</span>
        <button className="chatCloseBtn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="chatMessages">
        {messages.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <div className="chatInputWrapper">
        <input
          className="chatInput"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="chatSendBtn" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
