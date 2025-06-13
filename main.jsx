import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => (
  <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row items-center justify-center p-6">
    {/* LEFT SIDE: Banner */}
    <div className="w-full md:w-1/2 mb-6 md:mb-0">
      <img
        src="https://res.cloudinary.com/dvkhiqzbm/image/upload/v1749789965/banner_upk3yf.png"
        alt="Finesse In Business Academy"
        className="w-full rounded shadow-lg"
      />
    </div>

    {/* RIGHT SIDE: Sign-In Panel */}
    <div className="w-full md:w-1/2 bg-slate-800 p-6 rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Welcome Future Entrepreneur</h2>
      <p className="mb-4 text-sm">JET Program participants must sign in using their issued JET ID.</p>

      <form className="space-y-4">
        <div>
          <label htmlFor="jetId" className="block text-sm font-semibold mb-1">JET ID Number</label>
          <input
            id="jetId"
            type="text"
            placeholder="Enter your JET ID"
            className="w-full p-2 rounded text-black"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold mb-1">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-full p-2 rounded text-black"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-semibold transition"
        >
          Sign In
        </button>
        <p className="text-sm mt-2 text-center">
          Need an account? <a href="#" className="text-blue-400 underline">Sign Up</a>
        </p>
      </form>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

