import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const App = () => (
  <div className="min-h-screen flex bg-slate-900 text-white">
    {/* Left Side - Banner */}
    <div className="w-2/3">
      <img
        src="https://res.cloudinary.com/dvkhiqzbm/image/upload/v1749789965/banner_upk3yf.png"
        alt="Finesse In Business Academy"
        className="w-full h-full object-cover"
      />
    </div>

    {/* Right Side - Login */}
    <div className="w-1/3 flex flex-col justify-center items-center p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome Future Entrepreneur</h1>
      <p className="mb-6 text-center">
        JET Program participants must sign in using their issued JET ID.
      </p>
      <input
        type="text"
        placeholder="JET ID Number"
        className="mb-4 px-4 py-2 w-full text-black rounded"
      />
      <input
        type="password"
        placeholder="Password"
        className="mb-4 px-4 py-2 w-full text-black rounded"
      />
      <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white w-full">
        Sign In
      </button>
      <p className="mt-4 text-sm">
        Need an account? <a href="#" className="text-blue-400 underline">Sign Up</a>
      </p>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

