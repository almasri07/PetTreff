import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function SignupForm() {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/req/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });
      if (res.ok) {
        alert("Signup successful!");
      } else {
        alert("Signup failed. Try again.");
      }
    } catch {
      alert("Server error. Please try again later.");
    }
  };

  return (
    <section className="login-wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Sign Up</h1>
        <div className="inputbox">
          <ion-icon name="person-outline"></ion-icon>
          <input
            name="username"
            type="text"
            required
            value={data.username}
            onChange={handleChange}
          />
          <label>Name</label>
        </div>
        <div className="inputbox">
          <ion-icon name="mail-outline"></ion-icon>
          <input
            name="email"
            type="email"
            required
            value={data.email}
            onChange={handleChange}
          />
          <label>Email</label>
        </div>
        <div className="inputbox">
          <ion-icon name="lock-closed-outline"></ion-icon>
          <input
            name="password"
            type="password"
            required
            value={data.password}
            onChange={handleChange}
          />
          <label>Password</label>
        </div>
        <div className="inputbox">
          <ion-icon name="lock-closed-outline"></ion-icon>
          <input
            name="confirmPassword"
            type="password"
            required
            value={data.confirmPassword}
            onChange={handleChange}
          />
          <label>Confirm Password</label>
        </div>
        <button type="submit">Sign Up</button>
        <div className="register">
          <p>
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </form>
    </section>
  );
}
