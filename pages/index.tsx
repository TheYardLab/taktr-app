import { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'mfurry' && password === '12142024') {
      window.location.href = '/dashboard';
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ backgroundColor: 'var(--brand-bg)' }}
    >
      {/* 🔹 Header with Logo */}
      <header className="flex items-center p-4 bg-white shadow">
        <img 
          src="/logo.png" 
          alt="TaktR Logo" 
          className="w-10 h-auto"
        />
      </header>

      {/* 🔹 Centered Login Form */}
      <main className="flex flex-1 items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold text-center mb-6 text-brand">
            Welcome to TaktR
          </h1>
          
          <input
            type="text"
            placeholder="Username"
            className="border p-3 mb-4 w-full rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 mb-6 w-full rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="bg-brand text-white w-full p-3 rounded hover:brightness-110 transition"
          >
            Login
          </button>
        </div>
      </main>
    </div>
  );
}