// src/pages/UserPublicProfile.jsx
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { UsersApi, ProfileApi, FriendshipsApi, AuthApi } from "../../api/api";
// === Enum-Mapper (wie in deinem Profile.jsx) ===
const fromPetEnum = (e) =>
  ({ DOG: "Dog", CAT: "Cat", BIRD: "Bird", OTHER: "Other" }[e] || "Other");

const fromLookingEnum = (e) =>
  ({
    PLAYDATES: "Playdates",
    TRAINING: "Training",
    SITTING: "Sitting",
    MEETUPS: "Meetups",
  }[e] || "Playdates");

export default function UserPublicProfile() {
  const { id } = useParams(); // /users/:id
  const [me, setMe] = useState(null);

  const [user, setUser] = useState(null); // UsersApi.get
  const [profile, setProfile] = useState(null); // ProfileApi.getByUserId
  const [loading, setLoading] = useState(true);
  const [friendBusy, setFriendBusy] = useState(false);
  const [friendSent, setFriendSent] = useState(false);
  const [error, setError] = useState("");

  const isSelf = useMemo(() => {
    if (!me || !user) return false;
    return String(me.id) === String(user.id);
  }, [me, user]);

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setError("");

        // Eigene Identität laden (um isSelf/Buttons zu steuern)
        const [{ data: meData }, { data: userDto }] = await Promise.all([
          AuthApi.me(),
          UsersApi.get(id),
        ]);
        if (abort) return;
        setMe(meData);
        setUser(userDto);

        // Profil-Daten des fremden Users (bio, location, enums ...)
        try {
          const { data: prof } = await ProfileApi.getByUserId(id);
          if (!abort) setProfile(prof);
        } catch (e) {
          // Kein öffentliches Profil vorhanden? Dann leer lassen.
          if (!abort) setProfile(null);
        }
      } catch (e) {
        if (!abort) setError("Konnte Profil nicht laden.");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [id]);

  const handleAddFriend = async () => {
    if (!user) return;
    try {
      setFriendBusy(true);
      setError("");
      // Typischer DTO: { recipientId } – ggf. an dein Backend anpassen.
      await FriendshipsApi.create({ recipientId: user.id });
      setFriendSent(true);
    } catch (e) {
      setError("Freundschaftsanfrage fehlgeschlagen.");
    } finally {
      setFriendBusy(false);
    }
  };

  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />

        <div
          className="profileContainer"
          style={{ padding: 16, width: "100%" }}
        >
          {loading && <div>Wird geladen…</div>}
          {!loading && error && <div style={{ color: "salmon" }}>{error}</div>}

          {!loading && user && (
            <div
              className="profileCard"
              style={{
                border: "1px solid #333",
                borderRadius: 12,
                padding: 16,
                maxWidth: 820,
              }}
            >
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <img
                  src={user.profilePictureUrl || "/assets/default-avatar.png"}
                  alt={user.username}
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h1 style={{ margin: 0 }}>{user.username}</h1>
                  <div style={{ opacity: 0.75 }}>
                    {profile?.location ? `📍 ${profile.location}` : "📍 —"}
                  </div>
                </div>

                {!isSelf && (
                  <button
                    className="btn"
                    disabled={friendBusy || friendSent}
                    onClick={handleAddFriend}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 8,
                      border: "1px solid #444",
                      background: friendSent ? "#2e7d32" : "#1f1f1f",
                      color: "#fff",
                      cursor: friendBusy || friendSent ? "default" : "pointer",
                    }}
                  >
                    {friendSent
                      ? "Request sent ✓"
                      : friendBusy
                      ? "Sending…"
                      : "Add Friend"}
                  </button>
                )}
              </div>

              <hr style={{ borderColor: "#333", margin: "16px 0" }} />

              <div style={{ display: "grid", gap: 12 }}>
                <p>
                  <b>About:</b> {profile?.bio || "—"}
                </p>
                <p>
                  <b>Pet type:</b> {fromPetEnum(profile?.petType)}
                </p>
                <p>
                  <b>Looking for:</b> {fromLookingEnum(profile?.lookingFor)}
                </p>
                <p>
                  <b>Topics:</b> {profile?.topics || "—"}
                </p>
                <p>
                  <b>Preferred days:</b> {profile?.days || "—"}
                </p>
                <p>
                  <b>Messages allowed:</b>{" "}
                  {profile?.allowMessages ? "Yes" : "No"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
