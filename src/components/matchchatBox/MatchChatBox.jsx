import { useEffect, useRef, useState } from "react";
import "./matchchatbox.css";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ChatApi, UsersApi, PresenceApi } from "../../api/api";
import { fmtTime } from "../../utils/datetime";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const WS_BASE = `${API_BASE}/ws`;

export default function ChatPopup({ currentUser, onClose }) {
  const [interestAcceptedUsers, setInterestAcceptedUsers] = useState([]);

  const [onlineIdSet, setOnlineIdSet] = useState(new Set()); // Set<number>
  const [onlineNameSet, setOnlineNameSet] = useState(new Set()); // Set<string lowercased>
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]); // ChatMessageDTO[]
  const [input, setInput] = useState("");

  const stompRef = useRef(null);
  const subRef = useRef(null);
  const bottomRef = useRef(null);

  // --------------------   Hilfsfunktionen --------------------------------------------------------
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const normalizeFriends = (data) =>
    (data || [])
      .map((f) => ({
        id: toNum(f?.id ?? f?.user?.id ?? f?.friendId),
        username: String(
          f?.username ?? f?.user?.username ?? f?.friend?.username ?? ""
        ).trim(),
      }))
      .filter((x) => x.id !== null && x.username);

  const markIsOnline = (f) => {
    // bevorzugt: id, sonst username
    if (onlineIdSet.size > 0) return onlineIdSet.has(f.id);
    if (onlineNameSet.size > 0)
      return onlineNameSet.has(f.username.toLowerCase());
    return false;
  };


  // ----------------------- WebSocket Verbindung für Chat --------------------------------------
  useEffect(() => {
    const sock = new SockJS(WS_BASE, null, {
      transportOptions: {
        xhrStream: { withCredentials: true },
        xhrPolling: { withCredentials: true },
      },
    });

    const client = new Client({
      webSocketFactory: () => sock,
      reconnectDelay: 3000,
      onConnect: () => {
        subRef.current = client.subscribe("/user/queue/messages", (frame) => {
          try {
            const dto = JSON.parse(frame.body); // ChatMessageDTO
            setMessages((prev) => [...prev, dto]);
          } catch (e) {
            console.error("WS frame parse error:", e);
          }
        });
      },
    });

    client.debug = (msg) => console.log("[STOMP]", msg);
    client.activate();
    stompRef.current = client;

    return () => {
      try {
        subRef.current?.unsubscribe();
      } catch {}
      client.deactivate();
      stompRef.current = null;
    };
  }, []);

  //  -------------  history laden, wenn Freund ausgewählt  ------------------------
  useEffect(() => {
    if (!selectedFriend?.id || !currentUser?.id) return;
    (async () => {
      try {
        const res = await ChatApi.history(currentUser.id, selectedFriend.id);
        const list = Array.isArray(res.data) ? res.data : [];
        setMessages((prev) => {
          const isThisPair = (m) =>
            (m.senderUsername === currentUser.username &&
              m.recipientUsername === selectedFriend.username) ||
            (m.senderUsername === selectedFriend.username &&
              m.recipientUsername === currentUser.username);
          const others = prev.filter((m) => !isThisPair(m));
          return [...others, ...list];
        });
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    })();
  }, [selectedFriend?.id, currentUser?.id]);

  // -------------------- Auto-scrollen zu untersten Nachricht ------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedFriend]);

  // -------------------- Nachricht senden ----------------------------------
  const handleSend = () => {
    const content = input.trim();
    if (!content || !selectedFriend || !currentUser) return;
    const client = stompRef.current;
    if (!client || !client.connected) return;

    client.publish({
      destination: "/app/chat",
      body: JSON.stringify({ recipientId: selectedFriend.id, content }),
    });

    setInput("");
  };

  const goBack = () => {
    setSelectedFriend(null);
    setInput("");
  };

  // -------------------- Nachrichten für die aktive Konversation ------------------------
  const visible = selectedFriend
    ? messages.filter(
        (m) =>
          (m.senderUsername === currentUser?.username &&
            m.recipientUsername === selectedFriend.username) ||
          (m.senderUsername === selectedFriend.username &&
            m.recipientUsername === currentUser?.username)
      )
    : [];

  // ----------------------------- Render ---------------------------------
  return (
    <div className="chatPopup">
      <div className="chatHeader">
        {selectedFriend && (
          <button className="chatBackBtn" onClick={goBack} title="Back" />
        )}
        <span>
          {selectedFriend
            ? `Chat with ${selectedFriend.username}`
            : "Choose a friend"}
        </span>
        <button className="chatCloseBtn" onClick={onClose}>
          ×
        </button>
      </div>

      {!selectedFriend ? (
        // Liste der Freunde
        <ul className="friendList">
          {interestAcceptedUsers.map((f) => {
            const isOnline = markIsOnline(f);
            return (
              <li
                key={f.id}
                className="friendItem rightbarFriend"
                onClick={() => setSelectedFriend(f)}
                style={{ cursor: "pointer" }}
              >
                <div className="rightbarProfileImgContainer" />
                <span className="rightbarUsername">
                  {f.username}{" "}
                  <em style={{ fontSize: 12, opacity: 0.8 }}>
                    ({isOnline ? "online" : "offline"})
                  </em>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          <div className="chatSubHeader">
            <button className="chatBackLink" onClick={goBack}>
              ← Back to friends
            </button>
          </div>

          <div className="chatMessages">
            {visible.map((m, idx) => (
              <p key={m.id ?? idx}>
                <strong>{m.senderUsername}:</strong> {m.content}
                <span className="time"> {fmtTime(m.dateTime)}</span>
              </p>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="chatInputWrapper">
            <input
              className="chatInput"
              placeholder={`Message ${selectedFriend.username}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
                if (e.key === "Escape") goBack();
              }}
            />
            <button className="chatSendBtn" onClick={handleSend}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
