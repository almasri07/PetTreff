import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/sidebar";
import Feed from "../../components/feed/Feed";
import Rightbar from "../../components/rightbar/Rightbar";
import "./home.css";
import { Users } from "../../dummyData"; // assuming Users has profile info, etc.

const me = Users[0];

export default function Home() {
  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />
        <Feed currentUser={me} />
        <Rightbar />
      </div>
    </>
  );
}
