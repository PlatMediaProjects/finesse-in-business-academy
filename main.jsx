import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => (
<div className="flex justify-end p-6">
  <form className="bg-white text-black p-6 rounded shadow-md w-full max-w-sm">
    <h2 className="text-xl font-bold mb-4">Welcome Future Entrepreneur</h2>
    <p className="mb-4 text-sm">JET Program participants must sign in using their issued JET ID.</p>

    <label htmlFor="jetId" className="block text-sm font-medium">JET ID Number</label>
    <input
      type="text"
      id="jetId"
      name="jetId"
      placeholder="Enter your JET ID"
      className="mt-1 mb-3 w-full px-3 py-2 border rounded"
    />

    <label htmlFor="password" className="block text-sm font-medium">Password</label>
    <input
      type="password"
      id="password"
      name="password"
      placeholder="Enter your password"
      className="mt-1 mb-4 w-full px-3 py-2 border rounded"
    />

    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
    >
      Sign In
    </button>

    <p className="mt-4 text-sm text-center">
      Need an account? <a href="#" className="text-blue-600 underline">Sign Up</a>
    </p>
  </form>
</div>
 
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

