import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-indigo-600">
        CoverMate
      </div>

      <div className="space-x-6 text-sm font-medium">
        {!token ? (
          <>
            <Link to="/" className="hover:text-indigo-600">Login</Link>
            <Link to="/register" className="hover:text-indigo-600">Register</Link>
          </>
        ) : (
          <>
            <Link to="/profile" className="hover:text-indigo-600">Profile</Link>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
