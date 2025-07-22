import "./rightbar.css";
import { Link } from "react-router-dom";
import { Users } from "../../dummyData";
import Online from "../online/online";

export default function Rightbar() {
  return (
    <div className="rightbar">
      <div className="rightbarWrapper">
        <h4 className="rightbarTitle">Find a Match!</h4>
        <p className="rightbarText">
          Looking for other pet owners with similar interests or needs? Try our
          matching feature!
        </p>
        <Link to="/match" className="rightbarMatchButton">
          Go to Matching Page
        </Link>
        <div className="rightbarSuggestions">
          <h4 className="rightbarTitle">Suggested Matches</h4>
          <ul>
            <li>🐶 Bella (Looking for a playmate)</li>
            <li>🐱 Max (Interested in cat meetups)</li>
            <li>🐦 Tweety (Looking for a friend)</li>
          </ul>
        </div>
        <hr className="sidebarHr" />
        <h4 className="rightbarTitle">Online Freinds</h4>
        <ul className="rightbarFriendList">
          {Users.map((u) => (
            <Online key={u.id} user={u} />
          ))}
        </ul>
      </div>
    </div>
  );
}
