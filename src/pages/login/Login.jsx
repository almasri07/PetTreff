import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/req/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setErrorMessage(errorText || "Login failed");
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      setErrorMessage("Server error. Please try again later.");
    }
  };

  return (
    <section className="login-wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>

        {errorMessage && (
          <div className="dialog-row">
            <label className="text-center redText">{errorMessage}</label>
          </div>
        )}

        <div className="inputbox">
          <ion-icon name="email-outline"></ion-icon>
          <input
            name="username"
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="username">Username</label>
        </div>

        <div className="inputbox">
          <ion-icon name="lock-closed-outline"></ion-icon>
          <input
            name="password"
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password">Password</label>
        </div>

        <div className="register">
          <p>
            <a href="#">Forget Password?</a>
          </p>
        </div>

        <button type="submit">Log in</button>

        <div className="register">
          <p>
            Don't have an account? <a href="/signup">Register!!</a>
          </p>
        </div>
      </form>
    </section>
  );
}
