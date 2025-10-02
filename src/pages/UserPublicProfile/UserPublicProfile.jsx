import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { UsersApi, ProfileApi, FriendshipsApi, AuthApi } from "../../api/api";
//import "./userPublicProfile.css";

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
  const { id } = useParams();
  const [me, setMe] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [friendBusy, setFriendBusy] = useState(false);
  const [isPending, setIsPending] = useState(false); // Backend liefert: "PENDING" | "NONE"
  const [error, setError] = useState("");
  const [friendStatus, setFriendStatus] = useState(null); // "none" | "pending" | "friends"

  const isSelf = useMemo(
    () => !!me && !!user && String(me.id) === String(user.id),
    [me, user]
  );

  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        setError("");

        const [{ data: meData }, { data: userDto }] = await Promise.all([
          AuthApi.me(),
          UsersApi.get(id),
        ]);
        if (abort) return;
        setMe(meData);
        setUser(userDto);

        // Profil laden (tolerant gegen 404)
        try {
          const { data: prof } = await ProfileApi.getByUserId(id);
          if (!abort) setProfile(prof);
        } catch {
          if (!abort) setProfile(null);
        }

        // Status: "PENDING" | "NONE"
        try {
          console.log("Checking friendship status with user id:", userDto.id);
          const res = await FriendshipsApi.getStatus(userDto.id);
          console.log("------:", res?.data.status);
          if (!abort) {
            console.log("--voher---- isPending??????:", isPending);
            setIsPending(res?.data?.status === "PENDING");
            setFriendStatus(res?.data?.status);
            console.log("------ isPending??????:", isPending);
          }
          console.log("------ isPending??????:", isPending);
        } catch {
          if (!abort) setIsPending(false);
        }
      } catch {
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
    if (!user || isPending) return;
    try {
      setFriendBusy(true);
      setError("");
      await FriendshipsApi.create({ friendId: user.id }); // Backend erwartet friendId
      setIsPending(true); // optimistic UI
    } catch (e) {
      const code = e?.response?.status || e?.status;
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "";
      if (code === 409 || /already exists|pending|duplicate/i.test(msg)) {
        setIsPending(true);
      } else {
        setError("Freundschaftsanfrage fehlgeschlagen.");
      }
    } finally {
      setFriendBusy(false);
    }
  };

  return (
    <>
      <Topbar
        friendStatus={friendStatus}
        viewedUserId={user?.id}
        onSendFriendRequest={handleAddFriend}
      />
      <div className="homeContainer">
        <Sidebar />

        <div className="profileContainer">
          {loading && <div className="loading">Wird geladen…</div>}
          {!loading && error && <div className="error">{error}</div>}

          {!loading && user && (
            <div className="profileCard">
              <div className="profileHeader">
                <img
                  className="profileAvatar"
                  src={user.profilePictureUrl || "/assets/default-avatar.png"}
                  alt={user.username}
                />

                <div className="profileHeadText">
                  <h1 className="profileTitle">{user.username}</h1>
                  <div className="profileLocation">
                    {profile?.location ? `📍 ${profile.location}` : "📍 —"}
                  </div>
                </div>

                {!isSelf &&
                  (isPending ? (
                    <button
                      className="profileButton profileButton--success"
                      disabled
                    >
                      Request pending…
                    </button>
                  ) : (
                    <button
                      className="profileButton profileButton--primary"
                      disabled={friendBusy}
                      onClick={handleAddFriend}
                    >
                      {friendBusy ? "Sending…" : "Add Friend"}
                    </button>
                  ))}
              </div>

              <hr className="profileDivider" />

              <div className="profileDetails">
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
