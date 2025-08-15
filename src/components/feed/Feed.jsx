import { useState, useMemo, useEffect } from "react";
import Share from "../share/Share";
import "./feed.css";
import Post from "../post/Post";
import { Posts as initialPosts, Users } from "../../dummyData";

export default function Feed({ currentUser }) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState("all"); // "all" or "friends"
  const [followings, setFollowings] = useState([]); // array of userIds we follow

  useEffect(() => {
    // don’t run until we actually have a currentUser
    if (!currentUser) return;

    const myFollows =
      Users.find((u) => u.id === currentUser.id)?.followings || [];
    setFollowings(myFollows);
  }, [currentUser]); // ← watch the whole object, not just .id

  const addPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };
  const deletePost = (postId) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };
  const editPost = (postId, newFields) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...newFields } : p))
    );
  };

  // choose which posts to actually render
  const displayedPosts =
    filter === "friends"
      ? posts.filter((p) => followings.includes(p.userId))
      : posts;

  // memoize your <Post /> list
  const renderedPosts = useMemo(
    () =>
      displayedPosts.map((p) => (
        <Post key={p.id} post={p} onDelete={deletePost} onEdit={editPost} />
      )),
    [displayedPosts]
  );

  return (
    <div className="feed">
      <div className="feedWrapper">
        {/* —— FILTER BUTTONS —— */}
        <div className="feedFilter">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All Posts
          </button>
          <button
            className={filter === "friends" ? "active" : ""}
            onClick={() => setFilter("friends")}
          >
            Friends’ Posts
          </button>
        </div>

        {/* —— SHARE BOX —— */}
        <Share addPost={addPost} />

        {/* —— POSTS —— */}
        {renderedPosts}
      </div>
    </div>
  );
}

/*import { useState, useMemo } from "react";
import Share from "../share/Share";
import "./feed.css";
import Post from "../post/Post";
import { Posts as initialPosts } from "../../dummyData";

export default function Feed() {
  const [posts, setPosts] = useState(initialPosts);

  //  Fügt neuen Beitrag oben ein
  const addPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  //  Löscht Beitrag per ID
  const deletePost = (postId) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  //  Bearbeitet Felder eines Beitrags
  const editPost = (postId, newFields) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === postId ? { ...p, ...newFields } : p))
    );
  };

  //  useMemo für stabilen Key
  const renderedPosts = useMemo(
    () =>
      posts.map((p) => (
        <Post
          key={p.id} // wichtig: stabile ID für React
          post={p}
          onDelete={deletePost}
          onEdit={editPost}
        />
      )),
    [posts]
  );

  return (
    <div className="feed">
      <div className="feedWrapper">
        <Share addPost={addPost} />
        {renderedPosts}
      </div>
    </div>
  );
}
*/
