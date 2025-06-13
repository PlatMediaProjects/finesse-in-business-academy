import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => (
  <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
    <img
      src="https://res.cloudinary.com/dvkhiqzbm/image/upload/v1749789965/banner_upk3yf.png"
      alt="Finesse In Business Academy"
      className="max-w-full rounded mb-6 shadow-lg"
    />

    <div className="flex flex-col md:flex-row w-full max-w-6xl justify-between">
      <div className="w-full md:w-1/2 px-4">
        <h1 className="text-4xl font-bold mb-2">FINESSE IN BUSINESS ACADEMY</h1>
        <p className="text-xl mb-4">From a JET Program Entrepreneur to Business Ownership</p>
      </div>

      <div className="w-full md:w-1/2 px-4 mt-6 md:mt-0">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Welcome Future Entrepreneur</h2>
          <p className="mb-4 text-sm">JET Program participants must sign in using their issued JET ID.</p>

          <form className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="JET ID Number"
              className="p-2 rounded bg-slate-700 text-white border border-slate-600"
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 rounded bg-slate-700 text-white border border-slate-600"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded"
            >
              Sign In
            </button>
            <p className="text-sm text-center">
              Need an account? <a href="#" className="text-blue-400 hover:underline">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

