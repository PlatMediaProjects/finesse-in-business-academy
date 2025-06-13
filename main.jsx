import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => (
  <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
    <img
      src="https://res.cloudinary.com/dvkhiqzbm/image/upload/v1749789965/banner_upk3yf.png"
      alt="Finesse In Business Academy Banner"
      className="w-full max-w-5xl rounded-lg shadow-2xl border border-white mb-8"
    />
    <h1 className="text-4xl font-extrabold text-white mb-2 text-center">
    
    </h1>
    <p className="text-lg text-blue-200 mb-6 text-center">
    
    </p>
    <div className="flex gap-4">
      <a
        href="#"
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition duration-300"
      >
        Sign Up
      </a>
      <a
        href="#"
        className="bg-white text-blue-600 hover:text-white hover:bg-blue-400 font-bold py-3 px-6 rounded-lg shadow transition duration-300"
      >
        Log In
      </a>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

