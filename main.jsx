import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const App = () => (
  <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 border-4 border-white">
    <img src="/banner.png" alt="Finesse In Business Academy" className="max-w-full rounded mb-6 border border-white shadow-lg"/>
    <h1 className="text-4xl font-bold text-blue-300">Finesse In Business Academy</h1>
    <p className="mt-4 text-lg text-blue-100">From a JET Program Entrepreneur to Business Ownership</p>
    <div className="mt-8 space-x-4">
      <a href="#" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Sign Up</a>
      <a href="#" className="border border-blue-400 text-blue-400 px-6 py-2 rounded hover:bg-blue-400 hover:text-white transition">Log In</a>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(<App />)