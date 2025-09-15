import { useEffect, useState } from "react";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import { ProfileApi, AuthApi } from "../../api/api";
import "./profile.css";

/** Local enum mappers (UI <-> backend enums) */
const toPetEnum = (v) =>
  ({ Dog: "DOG", Cat: "CAT", Bird: "BIRD", Other: "OTHER" }[v] || "OTHER");

const fromPetEnum = (e) =>
  ({ DOG: "Dog", CAT: "Cat", BIRD: "Bird", OTHER: "Other" }[e] || "Other");

const toLookingEnum = (v) =>
  ({
    Playdates: "PLAYDATES",
    Training: "TRAINING",
    Sitting: "SITTING",
    Meetups: "MEETUPS",
  }[v] || "PLAYDATES");

const fromLookingEnum = (e) =>
  ({
    PLAYDATES: "Playdates",
    TRAINING: "Training",
    SITTING: "Sitting",
    MEETUPS: "Meetups",
  }[e] || "Playdates");

export default function Profile() {
  const [form, setForm] = useState({
    username: "", // shown in heading
    bio: "",
    location: "",
    petTypeUi: "Dog", // UI values
    lookingForUi: "Playdates",
    topics: "",
    days: "",
    allowMessagesUi: "yes", // "yes" | "no"
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        console.log("Loading...");
        // Run both requests in parallel
        const { data: user } = await AuthApi.me();
        const { data: profile } = await ProfileApi.getMe();
        console.log(":::::::::::::::::::");
        console.log("USERNAME:" + user.username);
        console.log(profile.bio);

        setForm((f) => ({
          ...f,
          username: user?.username ?? "unknown",
          bio: profile?.bio ?? "",
          location: profile?.location ?? "",
          petTypeUi: fromPetEnum(profile?.petType),
          lookingForUi: fromLookingEnum(profile?.lookingFor),
          topics: profile?.topics ?? "",
          days: profile?.days ?? "",
          allowMessagesUi: profile?.allowMessages ? "yes" : "no",
        }));
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const dto = {
      bio: form.bio,
      location: form.location,
      petType: toPetEnum(form.petTypeUi),
      lookingFor: toLookingEnum(form.lookingForUi),
      topics: form.topics,
      days: form.days,
      allowMessages: form.allowMessagesUi === "yes",
    };
    try {
      console.log("Saving...", dto);
      await ProfileApi.updateMe(dto); // <-- PUT /api/profile/me
      alert("Saved.");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed.");
    }
  };

  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />

        <div className="profileContainer">
          <h1>Profile of {form.username}</h1>

          <form className="profileForm" onSubmit={onSubmit}>
            <label>
              About me
              <textarea name="bio" value={form.bio} onChange={onChange} />
            </label>

            <label>
              Location
              <input
                name="location"
                value={form.location}
                onChange={onChange}
              />
            </label>

            <fieldset>
              <legend>Pet type</legend>
              {["Dog", "Cat", "Bird", "Other"].map((v) => (
                <label key={v}>
                  <input
                    type="radio"
                    name="petTypeUi"
                    value={v}
                    checked={form.petTypeUi === v}
                    onChange={onChange}
                  />
                  {v}
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend>I'm looking for</legend>
              {["Playdates", "Training", "Sitting", "Meetups"].map((v) => (
                <label key={v}>
                  <input
                    type="radio"
                    name="lookingForUi"
                    value={v}
                    checked={form.lookingForUi === v}
                    onChange={onChange}
                  />
                  {v}
                </label>
              ))}
            </fieldset>

            <label>
              Topics (comma separated)
              <input
                name="topics"
                placeholder="e.g., walks, health, events"
                value={form.topics}
                onChange={onChange}
              />
            </label>

            <label>
              Preferred days (comma separated)
              <input
                name="days"
                placeholder="e.g., Mon, Wed, Fri"
                value={form.days}
                onChange={onChange}
              />
            </label>

            <fieldset>
              <legend>Allow messages</legend>
              <label>
                <input
                  type="radio"
                  name="allowMessagesUi"
                  value="yes"
                  checked={form.allowMessagesUi === "yes"}
                  onChange={onChange}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="allowMessagesUi"
                  value="no"
                  checked={form.allowMessagesUi === "no"}
                  onChange={onChange}
                />
                No
              </label>
            </fieldset>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Loading…" : "Save"}
            </button>
          </form>

          <div className="profileCard">
            <h2>Preview</h2>
            <p>
              <b>About:</b> {form.bio || "—"}
            </p>
            <p>
              <b>Location:</b> {form.location || "—"}
            </p>
            <p>
              <b>Pet type:</b> {form.petTypeUi}
            </p>
            <p>
              <b>Looking for:</b> {form.lookingForUi}
            </p>
            <p>
              <b>Topics:</b> {form.topics || "—"}
            </p>
            <p>
              <b>Days:</b> {form.days || "—"}
            </p>
            <p>
              <b>Messages allowed:</b>{" "}
              {form.allowMessagesUi === "yes" ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
