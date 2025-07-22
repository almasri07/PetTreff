import "./chatPopup.css";

export default function ChatPopup({ onClose }) {
  return (
    <div className="chatPopup">
      <div className="chatHeader">
        <span>Chat</span>
        <button className="chatCloseBtn" onClick={onClose}>
          X
        </button>
      </div>
      <div className="chatMessages">
        <p>
          <strong>Shirley:</strong> Hey there!
        </p>
        <p>
          <strong>You:</strong> Hello{" "}
        </p>
      </div>
      <input className="chatInput" placeholder="Type a message..." />
    </div>
  );
}
