import "./topbar.css";
import {
  Search,
  Person,
  Beenhere,
  Chat,
  Notifications,
  Dialpad,
  NoEncryption,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function Topbar({ onHamburgerClic }) {
  console.log(onHamburgerClic);
  const [openPopup, setOpenPopup] = useState(null); // "friend" | "chat" | "notify" | null
  const dropdownRef = useRef(null);

  const handleIconClick = (type) => {
    console.log("Clicked on: ", type);
    setOpenPopup((prev) => (prev === type ? null : type));
  };

  // schließe das Dropdown, wenn außerhalb geklickt wird
  useEffect(() => {
    function handleClickOutside(event) {
      console.log("dropdownRef ist :  ", dropdownRef);
      console.log("event ist : ", event);
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
      <div className="hamburgerMenu" onClick={onHamburgerClic}>
        <span className="logoham">☰</span>
      </div>

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
          <Link to="/home" className="sidebarLink">
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
            onClick={() => handleIconClick("match")}
          >
            <Beenhere />
            <span className="topbarIconBadge">2</span>
          </div>
          <div
            className="topbarIconItem"
            onClick={() => handleIconClick("chat")}
          >
            <Chat />
            <span className="topbarIconBadge">3</span>
          </div>
          <div
            className="topbarIconItem"
            onClick={() => handleIconClick("notify")}
          >
            <Notifications />
            <span className="topbarIconBadge">4</span>
          </div>
        </div>

        {/* Dropdowns */}
        {openPopup && (
          <div className="topbarDropdown" ref={dropdownRef}>
            {openPopup === "friend" && (
              <div className="matchPopupContent">
                <div className="matchRequestItem">
                  <img
                    src="/assets/ali.jpg"
                    alt="Ali"
                    className="matchProfileImg"
                  />
                  <div className="matchInfo">
                    <span className="matchName">Ali Hamed</span>
                    <span className="matchMessage">
                      sent you a friend request
                    </span>
                  </div>
                  <div className="matchActions">
                    <button className="acceptBtn">Accept</button>
                    <button className="declineBtn">Decline</button>
                  </div>
                </div>

                <div className="matchRequestItem">
                  <img
                    src="/assets/maria.jpg"
                    alt="Maria"
                    className="matchProfileImg"
                  />
                  <div className="matchInfo">
                    <span className="matchName">Maria Costa</span>
                    <span className="matchMessage">
                      sent you a friend request
                    </span>
                  </div>
                  <div className="matchActions">
                    <button className="acceptBtn">Accept</button>
                    <button className="declineBtn">Decline</button>
                  </div>
                </div>
              </div>
            )}

            {/*openPopup === "match" && (
              <>
                <p>Jahn sent you a match request</p>
                <p>Lisa sent you a match request</p>
              </>
            )*/}
            {openPopup === "match" && (
              <div className="matchPopupContent">
                <div className="matchRequestItem">
                  <img
                    src="/assets/jahn.jpg"
                    alt="Jahn"
                    className="matchProfileImg"
                  />
                  <div className="matchInfo">
                    <span className="matchName">Jahn Kramer </span>
                    <span className="matchMessage">
                      sent you a match request
                    </span>
                  </div>
                  <div className="matchActions">
                    <button className="acceptBtn">Accept</button>
                    <button className="declineBtn">Decline</button>
                  </div>
                </div>

                <div className="matchRequestItem">
                  <img
                    src="/assets/lisa.jpg"
                    alt="Lisa"
                    className="matchProfileImg"
                  />
                  <div className="matchInfo">
                    <span className="matchName">Lisa Becker </span>
                    <span className="matchMessage">
                      sent you a match request
                    </span>
                  </div>
                  <div className="matchActions">
                    <button className="acceptBtn">Accept</button>
                    <button className="declineBtn">Decline</button>
                  </div>
                </div>
              </div>
            )}

            {openPopup === "chat" && (
              <div className="matchPopupContent">
                <div className="matchRequestItem">
                  {alert(openPopup)}
                  <img
                    src="/assets/ali.jpg"
                    alt="Ali"
                    className="matchProfileImg"
                  />
                  <div className="matchInfo">
                    <span className="matchName">Ali</span>
                    <span className="matchMessage">Hey, how's your pet?</span>
                  </div>
                </div>

                <div className="matchRequestItem">
                  <img
                    src="/assets/maria.jpg"
                    alt="Maria"
                    className="matchProfileImg"
                  />
                  <div className="matchInfo">
                    <span className="matchName">Maria</span>
                    <span className="matchMessage">
                      Let's meet up this weekend!
                    </span>
                  </div>
                </div>

                <div className="matchRequestItem">
                  <img
                    src="/assets/jahn.jpg"
                    alt="Jahn"
                    className="matchProfileImg"
                  />
                  <div className="matchInfo">
                    <span className="matchName">Jahn</span>
                    <span className="matchMessage">
                      Did you see the new pet adoption event?
                    </span>
                  </div>
                </div>
              </div>
            )}

            {openPopup === "notify" && (
              <div className="matchPopupContent">
                <div className="matchRequestItem">
                  {alert(openPopup)}
                  <img
                    src="/assets/user1.jpg"
                    alt="User1"
                    className="matchProfileImg"
                  />
                  <div className="matchInfo">
                    <span className="matchName">Emily</span>
                    <span className="matchMessage">liked your post</span>
                  </div>
                </div>

                <div className="matchRequestItem">
                  <img
                    src="/assets/user2.jpg"
                    alt="User2"
                    className="matchProfileImg"
                  />
                  <div className="matchInfo">
                    <span className="matchName">3 new users</span>
                    <span className="matchMessage">started following you</span>
                  </div>
                </div>
              </div>
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
