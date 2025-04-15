import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import bgImage from "../assets/images/bg.jpg";
import styled from "styled-components";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const { PUBLIC_SERVER_URL } = require("./api");
const host=PUBLIC_SERVER_URL
// import { showErrorToast, showSuccessToast } from "./toastUtils";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    toast.error("Please enter a valid email");
    return;
  }

  if (!password) {
    toast.error("Please enter your password");
    return;
  }
  
    try {
      console.log("Sending Login Request:", { email, password });
      const response = await fetch(`${host}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        localStorage.setItem("showLoginSuccess", "true");
        toast.success("Login successful!");
        console.log(data.user);
        console.log(data.token);
        
        // showSuccessToast("Login successful!");
        setUser(data.user);
          if (data.redirectTo) {
            console.log("1");
            navigate("/adminprofile");
          } else {
            console.log("2");
            navigate("/home");
          }
      }else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");     
      // showErrorToast("Login failed. Please try again.");
    }
  };

  return (
    <>
      {/* <Navbar/> */}
      <div
        className="login-container"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="login-box">
          <h2>LOGIN</h2>
          <form onSubmit={handleLogin}>
            {/* <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /> */}
            <StyledWrapper>
              <div className="group">
                <input
                  required
                  type="email"
                  value={email}
                  className="input"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="highlight" />
                <span className="bar" />
                <label>Email</label>
              </div>
            </StyledWrapper>
            {/* <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required /> */}
            <StyledWrapper>
              <div className="group">
                <input
                  required
                  type="password"
                  value={password}
                  className="input"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="highlight" />
                <span className="bar" />
                <label>Password</label>
              </div>
            </StyledWrapper>
            <button type="submit">Login</button>
          </form>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastStyle={{
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
          }}
          closeButtonStyle={{
            alignSelf: 'self-end',
            color: 'white',
            marginLeft: '16px',
          }}
          progressStyle={{
            background: 'rgba(255, 255, 255, 0.3)',
            height: '3px',
          }}
        />
      </div>
    </>
  );
};

const StyledWrapper = styled.div`
  .group {
    position: relative;
    margin-bottom: 30px;
  }

  .input {
    font-size: 16px;
    padding: 10px 10px 10px 5px;
    display: block;
    width: 300px;
    border: none;
    border-bottom: 0.5px solid rgb(13, 255, 0);
    background: transparent;
    color: white;
  }

  .input:focus {
    outline: none;
    border-bottom: none;
  }

  label {
    color: white;
    font-size: 18px;
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    left: 5px;
    top: 10px;
    transition: 0.2s ease all;
    -moz-transition: 0.2s ease all;
    -webkit-transition: 0.2s ease all;
  }

  .input:focus ~ label,
  .input:valid ~ label {
    top: -20px;
    font-size: 14px;
    color: rgb(0, 0, 0);
  }

  .bar {
    position: relative;
    display: block;
    width: 300px;
  }

  .bar:before,
  .bar:after {
    content: "";
    height: 1px;
    width: 0;
    bottom: 10px;
    position: absolute;
    background: #5264ae;
    transition: 0.2s ease all;
    -moz-transition: 0.2s ease all;
    -webkit-transition: 0.2s ease all;
  }

  .bar:before {
    left: 50%;
  }

  .bar:after {
    right: 50%;
  }

  .input:focus ~ .bar:before,
  .input:focus ~ .bar:after {
    width: 50%;
  }

  .highlight {
    position: absolute;
    height: 60%;
    width: 100px;
    top: 25%;
    left: 0;
    pointer-events: none;
    opacity: 0.5;
  }

  .input:focus ~ .highlight {
    animation: inputHighlighter 0.3s ease;
  }

  @keyframes inputHighlighter {
    from {
      background: #5264ae;
    }

    to {
      width: 0;
      background: transparent;
    }
  }
`;

export default Login;
