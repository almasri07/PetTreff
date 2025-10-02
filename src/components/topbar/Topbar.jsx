/*
// src/components/topbar/Topbar.jsx
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
import {
  UsersApi,
  ProfileApi,
  NotificationsApi,
  FriendshipsApi,
  MatchApi,
} from "../../api/api";

export default function Topbar({
  onHamburgerClick,
  friendStatus,
  viewedUserId,
  onSendFriendRequest,
}) {
  const navigate = useNavigate();

  // UI / Popups
  const [openPopup, setOpenPopup] = useState(null); // "friend" | "match" | "chat" | "notify" | null
  const containerRef = useRef(null);

  // Profilbild (aktueller User)
  const [profilePicUrl, setProfilePicUrl] = useState("/assets/001.jpg");

  // Suche
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notifications (Polling)
  const [friendNotifs, setFriendNotifs] = useState([]); // FRIEND_REQUEST (unread)
  const [matchNotifs, setMatchNotifs] = useState([]); // MATCH_INTEREST (unread)
  const actorCacheRef = useRef(new Map());

  // === Profilbild laden ===
  useEffect(() => {
    (async () => {
      try {
        const { data } = await ProfileApi.getMe();
        setProfilePicUrl(data?.urlProfilePicture || "/assets/001.jpg");
      } catch {
        setProfilePicUrl("/assets/001.jpg");
      }
    })();
  }, []);

  // === Suche (debounced) ===
  const goToFullResults = () => {
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/search?query=${encodeURIComponent(q)}`);
  };

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
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // === Klick außerhalb schließt Dropdowns ===
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenPopup(null);
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleIconClick = (type) => {
    setOpenPopup((prev) => (prev === type ? null : type));
    setSearchOpen(false);
  };

  // === Polling: Notifications laden (toleranter Filter) ===
  useEffect(() => {
    let cancelled = false;

    const normType = (t) =>
      String(t || "")
        .toUpperCase()
        .replace(/\s+/g, "_");

    const isUnread = (n) => {
      if (typeof n.read === "boolean") return n.read === false;

      const status = String(n.status || n.state || "").toUpperCase();
      if (status) return ["UNREAD", "NEW", "PENDING"].includes(status);

      if ("readAt" in n) return n.readAt == null;

      return true;
    };

    const isFriendType = (t) => {
      if (t.includes("FRIEND") && t.includes("REQUEST")) return true;
      return [
        "FRIEND",
        "FRIEND_REQUEST",
        "FRIEND_REQUEST_RECEIVED",
        "FRIENDSHIP_REQUEST",
      ].includes(t);
    };

    const isMatchType = (t) => {
      if (t.includes("MATCH") && t.includes("INTEREST")) return true; // e.g. MATCH_INTEREST, MATCH_INTEREST_RECEIVED
      return ["MATCH", "MATCH_REQUEST", "MATCH_REQUEST_INTEREST"].includes(t);
    };

    const resolveActorId = (n) =>
      n.actorId ??
      n.actorUserId ??
      n.senderId ??
      n.initiatorId ??
      n.fromUserId ??
      n.sourceUserId;

    const enrich = async (n) => {
      const actorId = resolveActorId(n);
      if (!actorId)
        return {
          ...n,
          actor: { username: "User", avatar: "/assets/001.jpg" },
        };

      if (actorCacheRef.current.has(actorId)) {
        return { ...n, actor: actorCacheRef.current.get(actorId) };
      }

      try {
        const [{ data: user }, profRes] = await Promise.all([
          UsersApi.get(actorId),
          ProfileApi.getByUserId(actorId).catch(() => null),
        ]);
        const actor = {
          username: user?.username ?? `user#${actorId}`,
          avatar:
            user?.profilePictureUrl ||
            profRes?.data?.urlProfilePicture ||
            "/assets/001.jpg",
        };
        actorCacheRef.current.set(actorId, actor);
        return { ...n, actor };
      } catch {
        const actor = {
          username: `user#${actorId}`,
          avatar: "/assets/001.jpg",
        };
        actorCacheRef.current.set(actorId, actor);
        return { ...n, actor };
      }
    };

    const fetchNotifs = async () => {
      try {
        const { data } = await NotificationsApi.list();
        const all = Array.isArray(data) ? data : [];

        // Nur UNGELESENE Notifications behalten und solche, die nicht als "dismissed" markiert sind
        const unread = all
          .filter(isUnread)
          .filter((n) => !dismissedIdsRef.current.has(notifIdOf(n)));

        // Typen zuordnen
        const withTypes = unread.map((n) => ({
          ...n,
          __TYPE: normType(
            n.type || n.notificationType || n.kind || n.eventType
          ),
        }));

        // FRIEND und MATCH filtern
        const friends = withTypes.filter((n) => isFriendType(n.__TYPE));
        const matches = withTypes.filter((n) => isMatchType(n.__TYPE));

        // Enrichment (z.B. Username/Avatar laden)
        const [enFriends, enMatches] = await Promise.all([
          Promise.all(friends.map(enrich)),
          Promise.all(matches.map(enrich)),
        ]);

        // Nur ungelese Notifications anzeigen
        if (!cancelled) {
          setFriendNotifs(enFriends);
          setMatchNotifs(enMatches);
        }
      } catch {
        // silent
      }
    };

    fetchNotifs(); // sofort
    const id = setInterval(fetchNotifs, 10000); // alle 10s
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // === Aktionen: Friend-Requests ===
  const acceptFriend = async (notif) => {
    try {
      await FriendshipsApi.accept(notif.refId);
      await NotificationsApi.readOne(notif.id).catch(() => {});
      setFriendNotifs((arr) => arr.filter((x) => x.id !== notif.id));
    } catch {}
  };

  const declineFriend = async (notif) => {
    try {
      await FriendshipsApi.decline(notif.refId);
      await NotificationsApi.readOne(notif.id).catch(() => {});
      setFriendNotifs((arr) => arr.filter((x) => x.id !== notif.id));
    } catch {}
  };

  // === Aktionen: Match-Interests (ACCEPT / DECLINE) ===
  // top-level in Topbar component:
  const dismissedIdsRef = useRef(new Set());
  const notifIdOf = (n) => n?.id ?? n?.notificationId ?? n?.uuid ?? n?._id;

  const acceptMatchInterest = async (notif) => {
    const nid = notifIdOf(notif);
    // Optimistic remove + shield from race with polling:
    if (nid) dismissedIdsRef.current.add(nid);
    setMatchNotifs((arr) => arr.filter((x) => notifIdOf(x) !== nid));
    try {
      await MatchApi.accept(notif.refId); // interestId on backend
      if (nid) await NotificationsApi.readOne(nid).catch(() => {});
    } catch (e) {
      // rollback if you like:
      if (nid) dismissedIdsRef.current.delete(nid);
    }
  };

  const declineMatchInterest = async (notif) => {
    const nid = notifIdOf(notif);
    if (nid) dismissedIdsRef.current.add(nid);
    setMatchNotifs((arr) => arr.filter((x) => notifIdOf(x) !== nid));
    try {
      await MatchApi.decline(notif.refId);
      if (nid) await NotificationsApi.readOne(nid).catch(() => {});
    } catch (e) {
      if (nid) dismissedIdsRef.current.delete(nid);
    }
  };

  return (
    <div className="topbarContainer" ref={containerRef}>
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goToFullResults();
              } else if (e.key === "Escape") {
                setSearchOpen(false);
              }
            }}
          />
          {searchOpen && (
            <div className="searchDropdown">
              {loading && <div className="searchItem muted">Search…</div>}
              {!loading && results.length > 0 && (
                <button className="searchSeeAll" onClick={goToFullResults}>
                  Show all results ({results.length})
                </button>
              )}
              {!loading &&
                results.map((u) => (
                  <Link
                    key={u.id}
                    to={`/users/${u.id}`}
                    className="searchItem"
                    onClick={() => setSearchOpen(false)}
                  >
                    <img
                      src={u.profilePictureUrl || "/assets/001.jpg"}
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
            title="Friend requests"
          >
            <Person />
            <span className="topbarIconBadge">{friendNotifs.length}</span>
          </div>

         
          <div
            className="topbarIconItem"
            onClick={() => handleIconClick("match")}
            title="Match interests"
          >
            <Beenhere />
            <span className="topbarIconBadge">{matchNotifs.length}</span>
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

        
        {openPopup && (
          <div className="topbarDropdown">
            

            {openPopup === "friend" && (
              <div className="matchPopupContent">
                {friendNotifs.length === 0 && (
                  <div className="matchRequestItem">
                    <div className="matchInfo">
                      <span className="matchMessage">No friend requests</span>
                    </div>
                  </div>
                )}
                {friendNotifs.map((n) => (
                  <div className="matchRequestItem" key={n.id}>
                    <img
                      src={n.actor?.avatar || "/assets/001.jpg"}
                      alt={n.actor?.username || "User"}
                      className="matchProfileImg"
                    />
                    <div className="matchInfo">
                      <span className="matchName">
                        {n.actor?.username || "User"}
                      </span>
                      <span className="matchMessage">
                        sent you a friend request
                      </span>
                    </div>
                    <div className="matchActions">
                      <button
                        className="acceptBtn"
                        onClick={() => acceptFriend(n)}
                      >
                        Accept
                      </button>
                      <button
                        className="declineBtn"
                        onClick={() => declineFriend(n)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            
            {openPopup === "match" && (
              <div className="matchPopupContent">
                {matchNotifs.length === 0 && (
                  <div className="matchRequestItem">
                    <div className="matchInfo">
                      <span className="matchMessage">No match interests</span>
                    </div>
                  </div>
                )}
                {matchNotifs.map((n) => (
                  <div className="matchRequestItem" key={n.id}>
                    <img
                      src={n.actor?.avatar || "/assets/001.jpg"}
                      alt={n.actor?.username || "User"}
                      className="matchProfileImg"
                    />
                    <div className="matchInfo">
                      <span className="matchName">
                        {n.actor?.username || "User"}
                      </span>
                      <span className="matchMessage">
                        is interested in your match request
                      </span>
                    </div>
                    <div className="matchActions">
                      <button
                        className="acceptBtn"
                        onClick={() => acceptMatchInterest(n)}
                      >
                        Accept
                      </button>
                      <button
                        className="declineBtn"
                        onClick={() => declineMatchInterest(n)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {openPopup === "chat" && (
              <div className="matchPopupContent">
                <div className="matchRequestItem">
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
              </div>
            )}

           
            {openPopup === "notify" && (
              <div className="matchPopupContent">
                <div className="matchRequestItem">
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

        <img src={profilePicUrl} alt="Profile" className="topbarImg" />
      </div>
    </div>
  );
}
*/

// src/components/topbar/Topbar.jsx
import "./topbar.css";
import { Search, Beenhere, Chat, Notifications } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../AuthContext";
import {
  UsersApi,
  ProfileApi,
  NotificationsApi,
  MatchApi,
} from "../../api/api";

export default function Topbar({ onHamburgerClick }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ---------------- UI state ----------------
  const [openPopup, setOpenPopup] = useState(null); // 'match' | 'chat' | 'notify' | null
  const containerRef = useRef(null);

  // My identity & avatar
  const myUserId = user?.id ?? user?.userId ?? null;
  const [profilePicUrl, setProfilePicUrl] = useState("/assets/001.jpg");

  // Search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notifications
  const [matchNotifs, setMatchNotifs] = useState([]);
  const [chatNotifs, setChatNotifs] = useState([]);

  // Caches/guards
  const actorCacheRef = useRef(new Map());
  const dismissedIdsRef = useRef(new Set());
  const [busyIds, setBusyIds] = useState(new Set());
  const setBusy = (id, on) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const notifIdOf = (n) =>
    n?.id ?? n?.notificationId ?? n?.uuid ?? n?._id ?? null;

  // ---------------- load avatar ----------------
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!myUserId) {
        setProfilePicUrl("/assets/001.jpg");
        return;
      }
      const direct = user?.profilePictureUrl || user?.urlProfilePicture;
      if (direct) {
        setProfilePicUrl(direct);
        return;
      }
      try {
        const { data } = await ProfileApi.getByUserId(myUserId);
        if (!alive) return;
        setProfilePicUrl(data?.urlProfilePicture || "/assets/001.jpg");
      } catch {
        if (!alive) return;
        setProfilePicUrl("/assets/001.jpg");
      }
    })();
    return () => {
      alive = false;
    };
  }, [myUserId, user]);

  // ---------------- search (debounced) ----------------
  const goToFullResults = () => {
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/search?query=${encodeURIComponent(q)}`);
  };

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
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query, navigate]);

  // ---------------- open/close popups ----------------
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenPopup(null);
        setSearchOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") {
        setOpenPopup(null);
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const handleIconClick = (type) => {
    setOpenPopup((prev) => (prev === type ? null : type));
    setSearchOpen(false);
  };

  // ---------------- helpers ----------------
  const normType = (t) =>
    String(t || "")
      .toUpperCase()
      .replace(/\s+/g, "_");

  const isUnread = (n) => {
    if (typeof n.read === "boolean") return n.read === false;
    const status = String(n.status || n.state || "").toUpperCase();
    if (status)
      return ["UNREAD", "NEW", "PENDING", "REQUESTED"].includes(status);
    if ("readAt" in n) return n.readAt == null;
    return true;
  };

  const isMatchType = (t) => {
    if (
      t.includes("MATCH") &&
      (t.includes("INTEREST") || t.includes("REQUEST"))
    )
      return true;
    return [
      "MATCH",
      "MATCH_REQUEST",
      "MATCH_REQUEST_INTEREST",
      "MATCH_INTEREST",
      "MATCH_INTEREST_ACCEPTED",
      "MATCH_INTEREST_DECLINED",
    ].includes(t);
  };

  const isChatType = (t) => ["CHAT", "CHAT_MESSAGE", "MESSAGE"].includes(t);

  const resolveActorId = (n) => n.actorId ?? n.senderId ?? null;
  const resolveRecipientId = (n) => n.recipientId ?? n.receiverId ?? null;
  const resolveRequesterId = (n) =>
    n.requesterId ??
    n.senderId ??
    n.initiatorId ??
    n.fromUserId ??
    n.actorId ??
    null;

  const isPending = (n) => {
    const s = String(n.status || n.state || "").toUpperCase();
    if (!s) return true;
    return ["UNREAD", "NEW", "PENDING", "REQUESTED"].includes(s);
  };

  // Only for match items now
  const isActionableForMe = (n) => {
    if (!myUserId) return false;
    const t = n.__TYPE;
    const recipientId = resolveRecipientId(n);
    const requesterId = resolveRequesterId(n);
    const iAmRecipient = recipientId
      ? recipientId === myUserId
      : requesterId !== myUserId;

    if (["MATCH_INTEREST", "MATCH_REQUEST_INTEREST"].includes(t)) {
      return iAmRecipient && isPending(n);
    }
    return false;
  };

  const humanTextFor = (t, n) => {
    const recipientId = resolveRecipientId(n);
    const requesterId = resolveRequesterId(n);
    const iAmRecipient = recipientId
      ? recipientId === myUserId
      : requesterId !== myUserId;

    switch (t) {
      case "MATCH_INTEREST":
      case "MATCH_REQUEST_INTEREST":
        return iAmRecipient
          ? "is interested in your match request"
          : "you expressed interest";
      case "MATCH_INTEREST_ACCEPTED":
        return "accepted your match request";
      case "MATCH_INTEREST_DECLINED":
        return "declined your match request";
      default:
        return "sent you a notification";
    }
  };

  // Capped actor cache
  const MAX_CACHE = 200;
  const putActorInCache = (id, actor) => {
    const m = actorCacheRef.current;
    if (!m.has(id) && m.size >= MAX_CACHE) {
      const firstKey = m.keys().next().value;
      m.delete(firstKey);
    }
    m.set(id, actor);
  };

  const enrich = async (n) => {
    const actorId = resolveActorId(n);
    if (!actorId)
      return { ...n, actor: { username: "User", avatar: "/assets/001.jpg" } };

    if (actorCacheRef.current.has(actorId)) {
      return { ...n, actor: actorCacheRef.current.get(actorId) };
    }
    try {
      const [{ data: u }, profRes] = await Promise.all([
        UsersApi.get(actorId),
        ProfileApi.getByUserId(actorId).catch(() => null),
      ]);
      const actor = {
        username: u?.username ?? `user#${actorId}`,
        avatar:
          u?.profilePictureUrl ||
          profRes?.data?.urlProfilePicture ||
          "/assets/001.jpg",
      };
      putActorInCache(actorId, actor);
      return { ...n, actor };
    } catch {
      const fallback = {
        username: `user#${actorId}`,
        avatar: "/assets/001.jpg",
      };
      putActorInCache(actorId, fallback);
      return { ...n, actor: fallback };
    }
  };

  // ---------------- polling notifications (match + chat) ----------------
  useEffect(() => {
    let cancelled = false;

    const byTimeDesc = (a, b) => {
      const ta = new Date(a.createdAt || a.timestamp || 0).getTime();
      const tb = new Date(b.createdAt || b.timestamp || 0).getTime();
      return tb - ta;
    };

    const fetchNotifs = async () => {
      try {
        const { data } = await NotificationsApi.list();
        const all = Array.isArray(data) ? data : [];
        const allSorted = all.sort(byTimeDesc);

        const unread = allSorted
          .filter(isUnread)
          .filter((n) => !dismissedIdsRef.current.has(notifIdOf(n)));

        const withTypes = unread.map((n) => ({
          ...n,
          __TYPE: normType(
            n.type || n.notificationType || n.kind || n.eventType
          ),
        }));

        const matches = withTypes.filter((n) => isMatchType(n.__TYPE));
        const chats = withTypes.filter((n) => isChatType(n.__TYPE));

        const [enMatches, enChats] = await Promise.all([
          Promise.all(matches.map(enrich)),
          Promise.all(chats.map(enrich)),
        ]);

        if (!cancelled) {
          setMatchNotifs(enMatches);
          setChatNotifs(enChats);
        }
      } catch {
        // silent
      }
    };

    if (myUserId) {
      fetchNotifs();
      const id = setInterval(fetchNotifs, 10000);
      return () => {
        cancelled = true;
        clearInterval(id);
      };
    }
  }, [myUserId]);

  // ---------------- actions: match ----------------
  const acceptMatchInterest = async (notif) => {
    const nid = notifIdOf(notif);
    if (nid) {
      dismissedIdsRef.current.add(nid);
      setBusy(nid, true);
    }
    setMatchNotifs((arr) => arr.filter((x) => notifIdOf(x) !== nid));
    try {
      await MatchApi.accept(notif.refId); // POST /api/match/interests/{interestId}/accept
      if (nid) await NotificationsApi.readOne(nid).catch(() => {});
    } catch {
      if (nid) {
        dismissedIdsRef.current.delete(nid);
        setMatchNotifs((arr) => [notif, ...arr]); // rollback
      }
    } finally {
      if (nid) setBusy(nid, false);
    }
  };

  const declineMatchInterest = async (notif) => {
    const nid = notifIdOf(notif);
    if (nid) {
      dismissedIdsRef.current.add(nid);
      setBusy(nid, true);
    }
    setMatchNotifs((arr) => arr.filter((x) => notifIdOf(x) !== nid));
    try {
      await MatchApi.decline(notif.refId); // POST /api/match/interests/{interestId}/decline
      if (nid) await NotificationsApi.readOne(nid).catch(() => {});
    } catch {
      if (nid) {
        dismissedIdsRef.current.delete(nid);
        setMatchNotifs((arr) => [notif, ...arr]); // rollback
      }
    } finally {
      if (nid) setBusy(nid, false);
    }
  };

  // ---- NEW: click handlers (row = read + action) ----
  const handleChatNotifClick = async (n) => {
    const nid = notifIdOf(n);
    if (nid) {
      dismissedIdsRef.current.add(nid);
      setChatNotifs((arr) => arr.filter((x) => notifIdOf(x) !== nid));
      NotificationsApi.readOne(nid).catch(() => {});
    }
    const peer = n.actorId ?? n.senderId;
    if (peer) navigate(`/home?chatWith=${peer}`);
  };

  const handleMatchRowClickIfNonActionable = async (n) => {
    if (isActionableForMe(n)) return; // let buttons handle it
    const nid = notifIdOf(n);
    if (!nid) return;
    dismissedIdsRef.current.add(nid);
    setMatchNotifs((arr) => arr.filter((x) => notifIdOf(x) !== nid));
    NotificationsApi.readOne(nid).catch(() => {});
  };

  // ---------------- UI bits ----------------
  const Badge = ({ count }) =>
    count > 0 ? <span className="topbarIconBadge">{count}</span> : null;

  const IconButton = ({ onClick, title, children }) => (
    <div
      className="topbarIconItem"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.(e);
      }}
      title={title}
    >
      {children}
    </div>
  );

  const matchItems = useMemo(() => matchNotifs, [matchNotifs]);

  return (
    <div className="topbarContainer" ref={containerRef}>
      <div
        className="hamburgerMenu"
        onClick={onHamburgerClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onHamburgerClick?.(e);
        }}
      >
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goToFullResults();
              } else if (e.key === "Escape") {
                setSearchOpen(false);
              }
            }}
          />
          {searchOpen && (
            <div className="searchDropdown">
              {loading && <div className="searchItem muted">Search…</div>}
              {!loading && results.length > 0 && (
                <button className="searchSeeAll" onClick={goToFullResults}>
                  Show all results ({results.length})
                </button>
              )}
              {!loading &&
                results.map((u) => (
                  <Link
                    key={u.id}
                    to={`/users/${u.id}`}
                    className="searchItem"
                    onClick={() => setSearchOpen(false)}
                  >
                    <img
                      src={u.profilePictureUrl || "/assets/001.jpg"}
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
          <IconButton
            onClick={() => handleIconClick("match")}
            title="Match interests"
          >
            <Beenhere />
            <Badge count={matchItems.length} />
          </IconButton>

          <IconButton onClick={() => handleIconClick("chat")} title="Chat">
            <Chat />
            <Badge count={chatNotifs.length} />
          </IconButton>

          <IconButton
            onClick={() => handleIconClick("notify")}
            title="Notifications"
          >
            <Notifications />

            <Badge count={0} />
          </IconButton>
        </div>

        {openPopup && (
          <div className="topbarDropdown">
            {openPopup === "match" && (
              <div className="matchPopupContent">
                {matchItems.length === 0 && (
                  <div className="matchRequestItem">
                    <div className="matchInfo">
                      <span className="matchMessage">No match interests</span>
                    </div>
                  </div>
                )}
                {matchItems.map((n) => {
                  const actionable = isActionableForMe(n);
                  const nid = notifIdOf(n);
                  return (
                    <div
                      className="matchRequestItem"
                      key={n.id ?? nid}
                      role={!actionable ? "button" : undefined}
                      tabIndex={!actionable ? 0 : -1}
                      onClick={
                        !actionable
                          ? () => handleMatchRowClickIfNonActionable(n)
                          : undefined
                      }
                      onKeyDown={
                        !actionable
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ")
                                handleMatchRowClickIfNonActionable(n);
                            }
                          : undefined
                      }
                      style={!actionable ? { cursor: "pointer" } : undefined}
                    >
                      <img
                        src={n.actor?.avatar || "/assets/001.jpg"}
                        alt={n.actor?.username || "User"}
                        className="matchProfileImg"
                      />
                      <div className="matchInfo">
                        <span className="matchName">
                          {n.actor?.username || "User"}
                        </span>
                        <span className="matchMessage">
                          {humanTextFor(n.__TYPE, n)}
                        </span>
                      </div>
                      {actionable ? (
                        <div className="matchActions">
                          <button
                            className="acceptBtn"
                            disabled={busyIds.has(nid)}
                            onClick={() => acceptMatchInterest(n)}
                          >
                            Accept
                          </button>
                          <button
                            className="declineBtn"
                            disabled={busyIds.has(nid)}
                            onClick={() => declineMatchInterest(n)}
                          >
                            Decline
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {openPopup === "chat" && (
              <div className="matchPopupContent">
                {chatNotifs.length === 0 && (
                  <div className="matchRequestItem">
                    <div className="matchInfo">
                      <span className="matchMessage">No new messages</span>
                    </div>
                  </div>
                )}
                {chatNotifs.map((n) => (
                  <div
                    className="matchRequestItem"
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleChatNotifClick(n)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      handleChatNotifClick(n)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={n.actor?.avatar || "/assets/001.jpg"}
                      alt={n.actor?.username || "User"}
                      className="matchProfileImg"
                    />
                    <div className="matchInfo">
                      <span className="matchName">
                        {n.actor?.username || "User"}
                      </span>
                      <span className="matchMessage">sent you a message</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {openPopup === "notify" && (
              <div className="matchPopupContent">
                <div className="matchRequestItem">
                  <div className="matchInfo">
                    <span className="matchMessage">No other notifications</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <img src={profilePicUrl} alt="Profile" className="topbarImg" />
      </div>
    </div>
  );
}
