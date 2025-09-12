import { useState } from "react";
import {
  AddPhotoAlternate,
  AddReaction,
  Subtitles,
  AddLocationAlt,
} from "@mui/icons-material";
import "./share.css";
import { Users } from "../../dummyData";

export default function Share({ addPost }) {
  const [input, setInput] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [feeling, setFeeling] = useState("");
  const [location, setLocation] = useState("");
  const [caption, setCaption] = useState("");

  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [showFeelingInput, setShowFeelingInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  const [photoInputKey, setPhotoInputKey] = useState(Date.now());

  const currentUser = Users[0];

  const hideAllInputs = () => {
    setShowPhotoInput(false);
    setShowFeelingInput(false);
    setShowLocationInput(false);
    setShowCaptionInput(false);
  };

  const handlePhotoClick = (e) => {
    e.preventDefault();
    hideAllInputs();
    setShowPhotoInput(true);
    setPhotoInputKey(Date.now());
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      hideAllInputs();
    }
  };

  const handleFeelingClick = (e) => {
    e.preventDefault();
    hideAllInputs();
    setShowFeelingInput(true);
  };

  const handleLocationClick = (e) => {
    e.preventDefault();
    hideAllInputs();
    setShowLocationInput(true);
  };

  const handleCaptionClick = (e) => {
    e.preventDefault();
    hideAllInputs();
    setShowCaptionInput(true);
  };

  const handleShare = (e) => {
    e.preventDefault();
    if (
      !input.trim() &&
      !photoFile &&
      !feeling.trim() &&
      !location.trim() &&
      !caption.trim()
    )
      return;

    const photoUrl = photoFile ? URL.createObjectURL(photoFile) : "";

    const newPost = {
      id: Date.now(),
      desc: input.trim(),
      photo: photoUrl,
      feeling: feeling.trim(),
      location: location.trim(),
      caption: caption.trim(),
      date: "Just now",
      userId: currentUser.id,
      like: 0,
      comment: 0,
    };

    addPost(newPost);

    // 🔁 Alles zurücksetzen
    setInput("");
    setPhotoFile(null);
    setFeeling("");
    setLocation("");
    setCaption("");
    hideAllInputs();
  };

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img
            className="shareProfileImg"
            src={currentUser.profilePicture}
            alt=""
            onClick={hideAllInputs}
          />
          <input
            placeholder="What's on your mind?"
            className="shareInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <hr className="shareHr" />

        <form className="shareBottom" onSubmit={handleShare}>
          <div className="shareOptions">
            <div className="shareOption" onClick={handlePhotoClick}>
              <AddPhotoAlternate htmlColor="chocolate" className="shareIcon" />
              <span className="shareOptionText">Photo</span>
            </div>
            <div className="shareOption" onClick={handleFeelingClick}>
              <AddReaction htmlColor="#F1A438" className="shareIcon" />
              <span className="shareOptionText">Feeling</span>
            </div>
            <div className="shareOption" onClick={handleLocationClick}>
              <AddLocationAlt
                htmlColor="DarkOliveGreen"
                className="shareIcon"
              />
              <span className="shareOptionText">Location</span>
            </div>
            <div className="shareOption" onClick={handleCaptionClick}>
              <Subtitles htmlColor="mediumPurple" className="shareIcon" />
              <span className="shareOptionText">Caption</span>
            </div>
            <button className="shareButton" type="submit">
              Share
            </button>
          </div>

          {showPhotoInput && (
            <input
              type="file"
              accept="image/*"
              className="shareFileInputHidden"
              onChange={handlePhotoChange}
              key={photoInputKey}
              ref={(input) => input && input.click()}
            />
          )}

          {showFeelingInput && (
            <input
              type="text"
              placeholder="How are you feeling?"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && hideAllInputs()}
              onBlur={hideAllInputs}
              className="shareInputField"
              autoFocus
            />
          )}

          {showLocationInput && (
            <input
              type="text"
              placeholder="Where are you?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && hideAllInputs()}
              onBlur={hideAllInputs}
              className="shareInputField"
              autoFocus
            />
          )}

          {showCaptionInput && (
            <input
              type="text"
              placeholder="Add a caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && hideAllInputs()}
              onBlur={hideAllInputs}
              className="shareInputField"
              autoFocus
            />
          )}
        </form>
      </div>
    </div>
  );
}
