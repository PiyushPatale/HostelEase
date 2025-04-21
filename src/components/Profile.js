import React, { useEffect, useState } from "react";
import "../styles/Profile.css";
import bgImage from "../assets/images/profile-bg.jpg";
// import idCardImage from "../assets/images/idcard2.jpg";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const { PUBLIC_SERVER_URL } = require("./api");
const host = PUBLIC_SERVER_URL;

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [image, setImage] = useState(user?.profileImage || "");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(!user?.profileImage);  // if no image, assume we need to fetch

  // Fetch full user details from server on mount
  useEffect(() => {
    const fetchFullUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.id && !storedUser?._id) return;

      try {
        setIsUserLoading(true);
        const userId = storedUser.id || storedUser._id;
        const response = await fetch(`${host}/api/users/${userId}`);

        if (!response.ok) throw new Error("Failed to fetch user profile data");

        const fullUserData = await response.json();
        setUser(fullUserData);
        setImage(fullUserData.profileImage || "");
        localStorage.setItem("user", JSON.stringify(fullUserData));
      } catch (error) {
        console.error("Error fetching full user profile:", error);
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchFullUser();
  }, []);

  // Fetch user's profile image separately if needed
  useEffect(() => {
    const fetchUserProfileImage = async () => {
      const userId = user?.id || user?._id;
      if (!userId) return;

      setIsLoadingImage(true);
      try {
        const response = await fetch(`${host}/api/users/image/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch profile image");

        const data = await response.json();
        if (data.imageUrl) {
          setImage(data.imageUrl);
          const updatedUser = { ...user, profileImage: data.imageUrl };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error("Error fetching user profile image:", error);
      } finally {
        setIsLoadingImage(false);
      }
    };

    if (!user?.profileImage) {
      fetchUserProfileImage();
    }
  }, [user]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const toastId = toast.loading("Uploading image...");
    setIsLoadingImage(true);

    try {
      const userId = user?.id || user?._id;
      const response = await fetch(`${host}/api/users/upload/${userId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

      const data = await response.json();

      if (data.imageUrl) {
        setImage(data.imageUrl);
        const updatedUser = { ...user, profileImage: data.imageUrl };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.update(toastId, {
          render: "Image uploaded successfully ✅",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Image upload failed ❌",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.error("Error uploading image:", error);
    } finally {
      setIsLoadingImage(false);
    }
  };

  if (!user) return <h2>Please login first!</h2>;

  return (
    <div className="profile-container" style={{ backgroundImage: `url(${bgImage})` }}>
      {isUserLoading ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} />
        </div>
      ) : (
        <div className="id-card">
          <label htmlFor="file" className="custum-file-upload">
            <div className="icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {/* your SVG icon here */}
              </svg>
            </div>
            <div className="text">
              {isLoadingImage ? (
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              ) : image ? (
                <img src={image} alt="ID Photo" className="uploaded-img" />
              ) : (
                <span>Click to upload image</span>
              )}
            </div>
            <input id="file" type="file" onChange={handleImageUpload} />
          </label>

          <div className="user-details">
            <p><strong>{user.name}</strong></p>
            <p><strong>B. Tech</strong></p>
            <p><strong>{user.rollNumber}</strong></p>
            <p><strong>{user.roomNumber}</strong></p>
            <p><strong>{user.email}</strong></p>
            <p><strong>{user.mobileNumber}</strong></p>
          </div>

          <div className="roll">
            <p><strong>{user.rollNumber}</strong></p>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        toastStyle={{
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      />
    </div>
  );
};

export default Profile;
