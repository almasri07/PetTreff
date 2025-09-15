import "./topbar.css";
import {
  Search,
  Person,
  Beenhere,
  Chat,
  Notifications,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { UsersApi } from "../../api/api"; // <— wichtig

export default function Topbar({ onHamburgerClick }) {
  const navigate = useNavigate();
  const [openPopup, setOpenPopup] = useState(null); // "friend" | "chat" | "notify" | "match" | null
  const dropdownRef = useRef(null);

  // === Suche ===
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEU: Vollergebnis-Seite öffnen
  const goToFullResults = () => {
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/search?query=${encodeURIComponent(q)}`);
  };

  // Klick außerhalb: alle Popups + Suchdropdown schließen
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenPopup(null);
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleIconClick = (type) => {
    setOpenPopup((prev) => (prev === type ? null : type));
    setSearchOpen(false); // Suchdropdown zu, wenn anderes Popup auf
  };

  // Debounced Suche (300ms)
  useEffect(() => {
    if (!query?.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await UsersApi.search(query.trim());
        setResults(data || []);
        setSearchOpen(true);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Enter drückt: sofort suchen
  // const handleSearchKeyDown = async (e) => {
  //  if (e.key === "Enter") {
  /*
      e.preventDefault();
      if (!query.trim()) return;
      setLoading(true);
      try {
        const { data } = await UsersApi.search(query.trim());
        setResults(data || []);
        setSearchOpen(true);
      } finally {
        setLoading(false);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };
  */
  // GEÄNDERT: Enter öffnet /search?query=...
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToFullResults();
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  return (
    <div className="topbarContainer" ref={dropdownRef}>
      <div className="hamburgerMenu" onClick={onHamburgerClick}>
        <span className="logoham">☰</span>
      </div>

      <div className="topbarLeft">
        <span className="logo">TierTreff Logo</span>
      </div>

      <div className="topbarCenter">
        <div className="searchBar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for Username"
            className="searchInput"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchOpen && (
            <div className="searchDropdown">
              {loading && <div className="searchItem muted">Search…</div>}
              {/* NEU: Footer-Button */}
              {!loading && results.length > 0 && (
                <button className="searchSeeAll" onClick={goToFullResults}>
                  Show all results ({results.length})
                </button>
              )}

              {!loading &&
                results.map((u) => (
                  <Link
                    key={u.id}
                    to={`/users/${u.id}`} // passe an deine Routen an
                    className="searchItem"
                    onClick={() => setSearchOpen(false)}
                  >
                    <img
                      src={u.profilePictureUrl || "/assets/default-avatar.png"}
                      alt={u.username}
                      className="searchAvatar"
                    />
                    <div className="searchText">
                      <div className="searchUsername">@{u.username}</div>
                    </div>
                  </Link>
                ))}
            </div>
          )}
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

        {/* Deine bestehenden Popups bleiben wie gehabt … */}
        {openPopup && (
          <div className="topbarDropdown">
            {/* friend / match / chat / notify Inhalte */}
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
