import "./topbar.css";
import { Search, Person, Chat, Notifications } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function Topbar() {
  const [openPopup, setOpenPopup] = useState(null); // "friend" | "chat" | "notify" | null
  const dropdownRef = useRef(null);

  const handleIconClick = (type) => {
    setOpenPopup((prev) => (prev === type ? null : type));
  };

  // schließe das Dropdown, wenn außerhalb geklickt wird
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenPopup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <span className="logo">TierTreff Logo</span>
      </div>

      <div className="topbarCenter">
        <div className="searchBar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for friends, posts or match"
            className="searchInput"
          />
        </div>
      </div>

      <div className="topbarRight">
        <div className="topbarLinks">
          <Link to="/" className="sidebarLink">
            <span className="topbarLink">Go to Home</span>
          </Link>
        </div>

        <div className="topbarIcons">
          <div
            className="topbarIconItem"
            onClick={() => handleIconClick("friend")}
          >
            <Person />
            <span className="topbarIconBadge">1</span>
          </div>
          <div
            className="topbarIconItem"
            onClick={() => handleIconClick("chat")}
          >
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
          <div
            className="topbarIconItem"
            onClick={() => handleIconClick("notify")}
          >
            <Notifications />
            <span className="topbarIconBadge">3</span>
          </div>
        </div>

        {/* Dropdowns */}
        {openPopup && (
          <div className="topbarDropdown" ref={dropdownRef}>
            {openPopup === "friend" && (
              <>
                <p>Ali sent you a friend request</p>
                <p>Maria sent you a friend request</p>
              </>
            )}
            {openPopup === "chat" && (
              <>
                <p>You have 2 new messages</p>
                <p>Click to read your inbox</p>
              </>
            )}
            {openPopup === "notify" && (
              <>
                <p>Someone liked your post</p>
                <p>You have 3 new followers</p>
              </>
            )}
          </div>
        )}

        <img
          src="assets/logan-weaver-lgnwvr-iBAKOYi-vVQ-unsplash.jpg"
          alt=""
          className="topbarImg"
        />
      </div>
    </div>
  );
}
