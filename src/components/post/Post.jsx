import React, { useState } from "react"; // React importiert für memo
import "./post.css";
import {
  AddPhotoAlternate,
  FavoriteBorder,
  Comment,
  Send,
} from "@mui/icons-material";
import { Users } from "../../dummyData";

function Post({ post, onDelete, onEdit }) {
  const [like, setLike] = useState(post.like);
  const [isLiked, setIsLiked] = useState(false);

  // ✅ Initialisierung direkt aus post.comments (wenn vorhanden & gültig)
  const [comments, setComments] = useState(
    Array.isArray(post.comments)
      ? post.comments.filter(
          (c) =>
            typeof c === "object" &&
            c !== null &&
            "username" in c &&
            "profilePicture" in c &&
            "text" in c
        )
      : []
  );

  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [editingCommentIndex, setEditingCommentIndex] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isEditingPost, setIsEditingPost] = useState(false);

  // ✅ Eingabewerte als Objekt gebündelt für bessere Verwaltung
  const [editForm, setEditForm] = useState({
    desc: post.desc || "",
    caption: post.caption || "",
    feeling: post.feeling || "",
    location: post.location || "",
  });

  const currentUser = Users[0];

  const likeHandler = () => {
    setLike(isLiked ? like - 1 : like + 1);
    setIsLiked(!isLiked);
  };

  const handleAddComment = () => {
    if (commentInput.trim() !== "") {
      setComments([
        ...comments,
        {
          text: commentInput,
          username: currentUser.username,
          profilePicture: currentUser.profilePicture,
        },
      ]);
      setCommentInput("");
    }
  };

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
    setTimeout(() => {
      if (!showComments) {
        const input = document.getElementById(`comment-input-${post.id}`);
        if (input) input.focus();
      }
    }, 0);
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <img
              className="postProfileImg"
              src={Users.find((u) => u.id === post.userId)?.profilePicture}
              alt=""
            />
            <span className="postUsername">
              {Users.find((u) => u.id === post.userId)?.username}
            </span>
            <span className="postDate"> {post.date}</span>
          </div>
          <div className="postTopRight">
            {post.feeling && (
              <span className="postFeeling">feeling {post.feeling}</span>
            )}
            {post.location && (
              <span className="postLocation">in {post.location}</span>
            )}
            {post.userId === currentUser.id && (
              <div className="postOptionsMenu">
                <button
                  className="postOptionBtn"
                  onClick={() => setIsEditingPost(true)}
                >
                  Edit
                </button>
                <button
                  className="postOptionBtn"
                  onClick={() => onDelete && onDelete(post.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="postCenter">
          {isEditingPost ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onEdit && onEdit(post.id, editForm);
                setIsEditingPost(false);
              }}
              className="editPostForm"
            >
              {["caption", "desc", "feeling", "location"].map((field) => (
                <input
                  key={field}
                  className="editPostInput"
                  value={editForm[field]}
                  onChange={(e) =>
                    setEditForm({ ...editForm, [field]: e.target.value })
                  }
                  placeholder={`Edit ${field}`}
                  style={{ marginBottom: 6 }}
                />
              ))}
              <div className="editPostButtonGroup">
                <button type="submit" className="editPostButton">
                  Save
                </button>
                <button
                  type="button"
                  className="editPostButton"
                  onClick={() => setIsEditingPost(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {post.caption && (
                <div className="postCaption">{post.caption}</div>
              )}
              {post?.desc && <div className="postText">{post.desc}</div>}
              {post.photo && (
                <img className="postImg" src={post.photo} alt="" />
              )}
            </>
          )}
        </div>

        <div className="postBottom">
          <div className="postBottomLeft">
            <div className="shareOptions">
              <div className="shareOption">
                <FavoriteBorder
                  htmlColor={isLiked ? "red" : "OrangeRed"}
                  className={isLiked ? "shareIcon liked" : "shareIcon"}
                  onClick={likeHandler}
                  style={{
                    transform: isLiked ? "scale(1.2)" : "scale(1)",
                    transition: "color 0.2s, transform 0.2s",
                  }}
                />
                <span className="shareOptionText">Like</span>
              </div>
              <div className="shareOption">
                <Comment
                  htmlColor="Sienna"
                  className="shareIcon"
                  onClick={handleToggleComments}
                />
                <span
                  className="shareOptionText"
                  onClick={handleToggleComments}
                  style={{ cursor: "pointer" }}
                >
                  Comment
                </span>
              </div>
              <div className="shareOption">
                <Send htmlColor="DarkMagenta" className="shareIcon" />
                <span className="shareOptionText">Share</span>
              </div>
            </div>
            {showComments && (
              <div className="commentInputSection">
                <input
                  id={`comment-input-${post.id}`}
                  type="text"
                  className="commentInput"
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddComment();
                  }}
                />
                <button
                  className="commentButton"
                  onClick={handleAddComment}
                  disabled={!commentInput.trim()}
                >
                  Post
                </button>
              </div>
            )}
          </div>
          <div className="postBottomRight">
            <div className="postLikesCounter">{like} Likes</div>
            <div className="postCommentsCounter">
              {comments.length} Comments
            </div>
          </div>
        </div>

        {showComments && comments.length > 0 && (
          <div className="commentsBox">
            <ul className="commentsList">
              {comments.slice(-20).map((c, i) => {
                const globalIdx =
                  i + comments.length - comments.slice(-20).length;
                const isEditing = editingCommentIndex === globalIdx;
                const key = `${c.username}-${i}`; // ✅ stabiler key
                return (
                  <li key={key} className="commentItem commentItemFlex">
                    <img
                      src={c.profilePicture}
                      alt=""
                      className="commentProfileImg"
                    />
                    <span style={{ fontWeight: 500, marginRight: 6 }}>
                      {c.username}
                    </span>
                    {isEditing ? (
                      <input
                        className="editCommentInput"
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setComments((comments) =>
                              comments.map((com, idx) =>
                                idx === globalIdx
                                  ? { ...com, text: editingCommentText }
                                  : com
                              )
                            );
                            setEditingCommentIndex(null);
                          } else if (e.key === "Escape") {
                            setEditingCommentIndex(null);
                          }
                        }}
                        onBlur={() => setEditingCommentIndex(null)}
                        autoFocus
                      />
                    ) : (
                      <span>{c.text}</span>
                    )}
                    {c.username === currentUser.username && !isEditing && (
                      <>
                        <button
                          className="editCommentButton"
                          onClick={() => {
                            setEditingCommentIndex(globalIdx);
                            setEditingCommentText(c.text);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="deleteCommentButton"
                          onClick={() => {
                            setComments((comments) =>
                              comments.filter((_, idx) => idx !== globalIdx)
                            );
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Wrappen für bessere Performance
export default React.memo(Post);
