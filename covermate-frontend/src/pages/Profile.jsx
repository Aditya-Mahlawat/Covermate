import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch {
        navigate("/");
      }
    };

    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-100">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-[420px]">

        <h2 className="text-3xl font-bold text-indigo-600 text-center mb-6">
          My Profile
        </h2>

        <div className="space-y-4 text-gray-700">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Name</span>
            <span>{user.name}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-medium">Email</span>
            <span>{user.email}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">DOB</span>
            <span>{user.dob || "Not Provided"}</span>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/");
          }}
          className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
