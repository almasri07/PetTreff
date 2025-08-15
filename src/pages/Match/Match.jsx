import "./match.css";
import Sidebar from "../../components/sidebar/sidebar";
import Topbar from "../../components/topbar/Topbar";
import MatchContainer from "../../components/match-container/matchContainer";

export default function Match() {
  return (
    <>
      <Topbar />
      <div className="homeContainer">
        <Sidebar />
        <MatchContainer />
      </div>
    </>
  );
}
