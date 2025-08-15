import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/home";
import Match from "./pages/Match/Match";
import Login from "./pages/login/Login";
import SignupForm from "./pages/login/SignupForm";
import "./App.css";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/match" element={<Match />} />
      <Route path="/signup" element={<SignupForm />} />
    </Routes>
  );
}
export default App;
