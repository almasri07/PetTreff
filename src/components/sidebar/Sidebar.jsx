import "./sidebar.css";
import { RssFeed, Forum, Beenhere, AccountBox } from "@mui/icons-material";
import { Users } from "../../dummyData";
import { Link } from "react-router-dom";
import { useState } from "react";
import ChatPopup from "../chatpopup/ChatPopup";

export default function Sidebar() {
  const suggested = [...Users].sort(() => 0.5 - Math.random()).slice(0, 5);
  const [showChatBox, setShowChatBox] = useState(false);
  const handleChatClick = () => {
    setShowChatBox((prev) => !prev);
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
          <li className="sidebarListItem" onClick={handleChatClick}>
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
              <span className="sidebarFriendName">{u.username}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
