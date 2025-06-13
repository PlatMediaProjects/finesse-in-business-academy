import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const App = () => (
  <div className="min-h-screen bg-slate-900 text-white flex flex-col lg:flex-row items-center justify-center p-6 space-y-8 lg:space-y-0 lg:space-x-12">
    {/* Left side: Banner and headline */}
    <div className="max-w-xl">
      <img
        src="https://res.cloudinary.com/dvkhiqzbm/image/upload/v1749789965/banner_upk3yf.png"
        alt="Finesse In Business Academy"
        className="rounded shadow-lg"
      />
    </div>

    {/* Right side: Sign-in form */}
    <div className="bg-white text-slate-800 p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Welcome Future Entrepreneur</h2>
      <p className="mb-2 text-sm">JET Program participants must sign in using their issued JET ID.</p>
      <form className="space-y-4">
        <div>
          <label htmlFor="jetId" className="block text-sm font-medium">JET ID Number</label>
          <input
            type="text"
            id="jetId"
            name="jetId"
            placeholder="Enter your JET ID"
            className="w-full px-4 py-2 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
        >
          Sign In
        </button>
        <p className="text-center text-sm mt-2">
          Need an account? <a href="#" className="text-blue-700 hover:underline">Sign Up</a>
        </p>
      </form>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

