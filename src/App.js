import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import LoggedInHome from "./components/LoggedInHome";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Profile from "./components/Profile";
import AdminPage from "./components/AdminPage";
import AdminProfile from "./components/AdminProfile";
import Dashboard from "./components/Dashboard";
import AboutUs from "./components/AboutUs";
import FloorPlan from "./components/FloorPlan";
import AnnexureI from "./components/AnnexureI";
import AnnexureII from "./components/AnnexureII";
import GirlsHostel from "./components/GirlsHostel";
import HostelGR from "./components/HostelGR";
import MyRoom from "./components/MyRoom";
import { ToastContainer } from "react-toastify";
import BoysAdmin from "./components/BoysAdmin";
import GirlsAdmin from "./components/GirlsAdmin";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      // // console.log(storedUser);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUser(null);
    }
  }, []);

  if (user === undefined) {
    return <div>Loading...</div>; // Prevent unnecessary redirects while loading
  }

  return (
    <>
      <Router>
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/home"
            element={
              user ? <LoggedInHome user={user} /> : <Navigate to="/login" />
            }
          />
          {/* <Route path="/admin" element={<AdminPage />} /> */}
          <Route
            path="/adminprofile"
            element={
              user?.email === "admin@iiitg.ac.in" ? (
                <AdminProfile />
              ) : (
                <Navigate to="/admin" />
              )
            }
          />

          <Route
            path="/boysadminprofile"
            element={
              user?.email === "boysadmin@iiitg.ac.in" ? (
                <BoysAdmin/>
              ) : (
                <Navigate to="/admin" />
              )
            }
          />

          <Route
            path="/girlsadminprofile"
            element={
              user?.email === "girlsadmin@iiitg.ac.in" ? (
                <GirlsAdmin/>
              ) : (
                <Navigate to="/admin" />
              )
            }
          />
          <Route
            path="/boys-hostel"
            element={
              user?.role === "admin" ? <AdminPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/annexure-I"
            element={
              user?.role === "admin" ? <AnnexureI /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/annexure-II"
            element={
              user?.role === "admin" ? <AnnexureII /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/girls-hostel"
            element={
              user?.role === "admin" ? (
                <GirlsHostel />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* <Route path="/adminprofile" element={<AdminProfile />} /> */}
          {/* <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} /> */}
          <Route
            path="/profile"
            element={
              user && user.role === "user" ? (
                <Profile user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={user.role === "admin" ? "/admin" : "/home"} />
              ) : (
                <Login setUser={setUser} />
              )
            }
          />
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate
                  to={user.role === "admin" ? "/admin-dashboard" : "/home"}
                />
              ) : (
                <Signup setUser={setUser} />
              )
            }
          />
          {/* <Route path="/login" element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />} /> */}

          <Route
            path="/admin-dashboard"
            element={
              user?.role === "admin" ? <Dashboard /> : <Navigate to="/login" />
            }
          />
          <Route path="/floor/:floorNumber" element={<FloorPlan />} />
          <Route path="/hostelrg" element={<HostelGR />} />
          <Route path="/my-room" element={<MyRoom />} />
          {/* <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/login" />}
          /> */}

          <Route path="/about" element={<AboutUs />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>

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
    </>
  );
}

export default App;
