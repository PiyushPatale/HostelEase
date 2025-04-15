import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/signup.css";
import styled from 'styled-components';
import { toast, ToastContainer } from "react-toastify";
import signupBg from "../assets/images/signup-bg.jpg"
const { PUBLIC_SERVER_URL } = require("./api");

const host=PUBLIC_SERVER_URL

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roomNumber: "",
    mobileNumber: "",
    rollNumber: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { email, rollNumber, roomNumber, mobileNumber } = formData;

    if (rollNumber.length !== 7) {
      toast.error("Roll number should be exactly 7 characters");
      return false;
    }

    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      toast.error("Mobile number must be 10 digits");
      return false;
    }

    if (roomNumber && !/^([A-Z]-?\d{3}|\d{3})$/.test(roomNumber.toUpperCase())) {
      toast.error("Room number must be like 101, G-101, or A101");
      return false;
    }

    if (!email.endsWith("@iiitg.ac.in")) {
      toast.error("Use your @iiitg.ac.in email");
      return false;
    }

    const rollSuffix = rollNumber.slice(-3);
    if (!email.includes(rollSuffix)) {
      toast.error("Email must include last 3 digits of roll number");
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const response = await fetch(`${host}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          roomNumber: formData.roomNumber.toUpperCase() // Ensure uppercase
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        toast.success("Signup successful!");
        navigate("/login");
      } else {
        toast.error(data.message || "Signup Failed");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  return (
    <div className="signup-container " style={{ backgroundImage: `url(${signupBg})` }}>
        <div className="container">
        <h2 >SIGNUP</h2>
        <form onSubmit={handleSignup}>
            <StyledWrapper>
            <div className="group">
                <input required type="text" name="name" className="input" onChange={handleChange}/>
                <span className="highlight" />
                <span className="bar" />
                <label>Name</label>
            </div>
            </StyledWrapper>
            <StyledWrapper>
            <div className="group">
                <input required type="text" name="rollNumber" className="input" onChange={handleChange} />
                <span className="highlight" />
                <span className="bar" />
                <label>Roll Number</label>
            </div>
            </StyledWrapper>
            <StyledWrapper>
            <div className="group">
                <input required type="email" name="email" className="input" onChange={handleChange} />
                <span className="highlight" />
                <span className="bar" />
                <label>Email (@iiitg.ac.in only)</label>
            </div>
            </StyledWrapper>
            <StyledWrapper>
            <div className="group">
                <input required type="password" name="password" className="input" onChange={handleChange} />
                <span className="highlight" />
                <span className="bar" />
                <label>Password</label>
            </div>
            </StyledWrapper>

            {/* <StyledWrapper>
            <div className="group">
                <input required type="text" name="roomNumber" className="input" onChange={handleChange} pattern="^([A-Za-z]-?\d{3}|\d{3})$"
                title="Format: 101 or G-101 (3 digits required)" />
                <span className="highlight" />
                <span className="bar" />
                <label>Room Number</label>
            </div>
            </StyledWrapper> */}
            <StyledWrapper>
            <div className="group">
              <input
                type="text"
                name="roomNumber"
                className="input"
                onChange={handleChange}
                pattern="^([A-Za-z]-?\d{3}|\d{3})$"
                title="Format: 101 or G-101 (3 digits required)"
              />
              <span className="highlight" />
              <span className="bar" />
              <label>Room Number</label>
            </div>
          </StyledWrapper>

            <StyledWrapper>
            <div className="group">
                <input required type="text" name="mobileNumber" className="input" onChange={handleChange} />
                <span className="highlight" />
                <span className="bar" />
                <label>Mobile Number</label>
            </div>
            </StyledWrapper>

            
            {/* <input type="email" name="email" placeholder="Email (@iiitg.ac.in only)" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="text" name="roomNumber" placeholder="Room Number" onChange={handleChange} required />
            <input type="text" name="mobileNumber" placeholder="Mobile Number" onChange={handleChange} required />
            <input type="text" name="rollNumber" placeholder="Roll Number" onChange={handleChange} required /> */}
            <button type="submit">Signup</button>
        </form>
        <ToastContainer position="top-center" autoClose={3000} />
        </div>
    </div>
  );
};

const StyledWrapper = styled.div`
  .group {
   position: relative;
    margin-bottom : 30px;
  }

  .input {
   font-size: 16px;
   padding: 10px 10px 10px 5px;
   display: block;
   width: 300px;
   border: none;
   border-bottom: 0.5px solid #515151;
   background: transparent;
   color: beige;
  }

  .input:focus {
   outline: none;
   border-bottom : none;
  }

  label {
   color: beige;
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

  .input:focus ~ label, .input:valid ~ label {
   top: -20px;
   font-size: 14px;
   color:rgb(212, 215, 20);
  }

  .bar {
   position: relative;
   display: block;
   width: 300px;
  }

  .bar:before, .bar:after {
   content: '';
   height: 1px;
   width: 0;
   bottom: 10px;
   position: absolute;
   background: #5264AE;
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

  .input:focus ~ .bar:before, .input:focus ~ .bar:after {
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
    background: #5264AE;
   }

   to {
    width: 0;
    background: transparent;
   }
  }`;

export default Signup;
