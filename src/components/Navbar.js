import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";
import logo from "../assets/images/iiitg-logo.png";

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  // const user = JSON.parse(localStorage.getItem("user")) || null;

  console.log(user);
  
  const handleProfileClick = () => {
    if (!user) {
      navigate("/login");
    } else if (user.email === "admin@iiitg.ac.in") {
      console.log("Yess");
      navigate("/adminprofile");
    } else {
      console.log("No");
      console.log("Navigating to User Profile");
      navigate("/profile");
    }
  };

  const handleLogoClick = () => {
    if (!user) {
      navigate("/");
    } else if (user.email === "admin@iiitg.ac.in") {
      navigate("/adminprfile"); // Changed to admin
    } else {
      navigate("/home");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null); // Ensure state updates
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div
        className="nav-left"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="IIITG Logo" className="logo" />
        <h1>IIIT Guwahati Hostel Management</h1>
      </div>      
      <div className="nav-right">
        {user ? (
          <>
            <button onClick={handleProfileClick} className="nav-button signup">
              {user.role === "admin" ? "Profile" : "Profile"}
            </button>
            <button onClick={handleLogout} className="nav-button">
              Logout
            </button>
            <Link to="/about" className="nav-button aboutus">
              About Us
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-button">
              Login
            </Link>
            <Link to="/signup" className="nav-button signup">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
