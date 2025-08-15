import "./sidebar.css";
import { RssFeed, Forum, Beenhere, AccountBox } from "@mui/icons-material";
import { Users } from "../../dummyData";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ChatPopup from "../chatpopup/ChatPopup";
import FriendRequestPopup from "../friendRequestPopup/FriendRequestPopup";

export default function Sidebar() {
  const loggedInUser = {
    id: 999,
    petType: "Dog",
  };

  // bring alle Users mit dem gleichen petType wie der eingeloggte User
  const samePetUsers = Users.filter(
    (user) =>
      user.id !== loggedInUser.id && user.petType === loggedInUser.petType
  );

  // mische die Liste der Users
  const shuffledUsers = samePetUsers.sort(() => 0.5 - Math.random());

  // nimm die ersten 5 Users als Vorschläge
  const suggested = shuffledUsers.slice(0, 5);

  const [showChatBox, setShowChatBox] = useState(false);
  const handleChatClick = () => {
    setShowChatBox((prev) => !prev);
  };

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setSelectedUser(null); // close popup
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendRequest = (userId) => {
    alert(`Friend request sent to user with ID: ${userId}`);
    setSelectedUser(null);
  };

  const popupRef = useRef(null);

  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const nameRefs = useRef({});

  const handleNameClick = (user) => {
    const element = nameRefs.current[user.id];
    if (element) {
      const rect = element.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + window.scrollY + -55,
        left: rect.left + window.scrollX + 0,
      });
    }
    setSelectedUser(user);
  };

  return (
    <div className="sidebar">
      <div className="sidebarWrapper">
        <ul className="sidebarList">
          <li
            className={`sidebarListItem${
              window.location.pathname === "/" ? " active" : ""
            }`}
          >
            <Link to="/" className="sidebarLink">
              <RssFeed className="sidebarIcon" />
              <span className="sidebarListItemText">Home</span>
            </Link>
          </li>
          <li
            className={`sidebarListItem${showChatBox ? " active" : ""}`}
            onClick={handleChatClick}
          >
            <Forum className="sidebarIcon" />
            <span className="sidebarListItemText">Chat</span>
          </li>
          <li
            className={`sidebarListItem${
              window.location.pathname === "/match" ? " active" : ""
            }`}
          >
            <Link to="/match" className="sidebarLink">
              <Beenhere className="sidebarIcon" />
              <span className="sidebarListItemText">Match</span>
            </Link>
          </li>
          <li className="sidebarListItem">
            <AccountBox className="sidebarIcon" />
            <span className="sidebarListItemText">Profile</span>
          </li>
        </ul>
        {showChatBox && <ChatPopup onClose={() => setShowChatBox(false)} />}
        <hr className="sidebarHr" />
        <h6 className="rightbarTitle">Suggested Friends</h6>
        <ul className="sidebarFriendList">
          {suggested.map((u) => (
            <li className="sidebarFriend" key={u.id}>
              <img src={u.profilePicture} alt="" className="sidebarFriendImg" />
              <span
                className="sidebarFriendName"
                style={{ cursor: "pointer" }}
                onClick={() => handleNameClick(u)}
                ref={(el) => (nameRefs.current[u.id] = el)}
              >
                {u.username}
              </span>
            </li>
          ))}
        </ul>

        {selectedUser && (
          <div
            ref={popupRef}
            style={{
              position: "absolute",
              top: popupPosition.top,
              left: popupPosition.left,
              zIndex: 9999,
            }}
          >
            <FriendRequestPopup
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
              onSend={handleSendRequest}
            />
          </div>
        )}
      </div>
    </div>
  );
}
