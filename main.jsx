import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => (
  <div className="p-8 max-w-screen-xl mx-auto">
    <img
      src="https://res.cloudinary.com/dvkhiqzbm/image/upload/v1749789965/banner_upk3yf.png"
      alt="Banner"
      className="rounded mb-6"
    />
    <div className="md:flex justify-between">
      <div>
        <h1 className="text-4xl font-bold">Finesse In Business Academy</h1>
        <p className="mt-2 text-lg">From a JET Program Entrepreneur to Business Ownership</p>
      </div>
      <div className="bg-slate-800 p-6 rounded mt-6 md:mt-0">
        <h2 className="text-xl mb-2">Sign In</h2>
        <input className="w-full mb-2 p-2 bg-slate-700 rounded" placeholder="JET ID Number" />
        <input className="w-full mb-2 p-2 bg-slate-700 rounded" type="password" placeholder="Password" />
        <button className="w-full bg-blue-600 py-2 mt-2 rounded">Sign In</button>
        <p className="text-sm mt-2 text-center">
          Need an account? <a href="#" className="text-blue-300">Sign Up</a>
        </p>
      </div>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

