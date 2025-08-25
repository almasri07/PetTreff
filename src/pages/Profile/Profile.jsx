

import React, { useState } from "react";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/sidebar";
import "./profile.css";

export default function Profile() {



  const [form, setForm] = useState({
    username: "john_doe",
    bio: "Lover of all things furry!",
    location: "New York, NY",
    petType: "Dog",         // Radio
    lookingFor: "Playdates",// Radio
    topics: "",             // Text (z.B. "Walking, Health")
    days: "",               // Text (z.B. "Mo, Mi, Fr")
    allowMessages: "yes",   // Radio
  });

 

  const onChange = (e) => {
  //  const newform = {...form};
  //   newform[e.target.name] = e.target.value;
  //   setForm(newform);




    const { name, value } = e.target;
    {alert(value)}
    console.log("hier ist : " , e.target);
    setForm( (f)=> ({ ...f, [name]: value }));


  };

  const onSubmit = (e) => {
    e.preventDefault();
    alert("Gespeichert (Frontend-only).");
  };

  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />

        <div className="profileContainer">
          <h1>{form.username}'s Profile</h1>

          <form className="profileForm" onSubmit={onSubmit}>
            <label>
              Bio
              <textarea name="bio" value={form.bio} onChange={onChange} />
            </label>

            <label>
              Location
              <input name="location" value={form.location} onChange={onChange} />
            </label>

            <fieldset>
              <legend>Pet Type</legend>
              {["Dog","Cat","Bird","Other"].map(v => (
                <label key={v}>
                  <input type="radio" name="petType" value={v} checked={form.petType === v} onChange={onChange}
                  />
                {/* {alert("Hello! I am an alert box!" , {v})} */}
                  {v}
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend>Ich suche</legend>
              {["Playdates","Training","Sitting","Meetups"].map(v => (
                <label key={v}>
                  <input
                    type="radio"
                    name="lookingFor"
                    value={v}
                    checked={form.lookingFor === v}
                    onChange={onChange}
                  />
                  {v}
                </label>
              ))}
            </fieldset>

            <label>
              Themen (kommasepariert)
              <input
                name="topics"
                placeholder="z. B. Walking, Health, Events"
                value={form.topics}
                onChange={onChange}
              />
            </label>

            <label>
              Bevorzugte Tage (kommasepariert)
              <input
                name="days"
                placeholder="z. B. Mo, Mi, Fr"
                value={form.days}
                onChange={onChange}
              />
            </label>

            <fieldset>
              <legend>Nachrichten erlauben</legend>
              <label>
                <input
                  type="radio"
                  name="allowMessages"
                  value="yes"
                  checked={form.allowMessages === "yes"}
                  onChange={onChange}
                />
                Ja
              </label>
              <label>
                <input
                  type="radio"
                  name="allowMessages"
                  value="no"
                  checked={form.allowMessages === "no"}
                  onChange={onChange}
                />
                Nein
              </label>
            </fieldset>

            <button type="submit" className="btn">Speichern</button>
          </form>

          <div className="profileCard">
            <h2>Vorschau</h2>
            <p><b>Bio:</b> {form.bio || "—"}</p>
            <p><b>Ort:</b> {form.location || "—"}</p>
            <p><b>Pet Type:</b> {form.petType}</p>
            <p><b>Ich suche:</b> {form.lookingFor}</p>
            <p><b>Themen:</b> {form.topics || "—"}</p>
            <p><b>Tage:</b> {form.days || "—"}</p>
            <p><b>Nachrichten erlaubt:</b> {form.allowMessages === "yes" ? "Ja" : "Nein"}</p>
          </div>
        </div>
      </div>
    </>
  );
}
