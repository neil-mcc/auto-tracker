import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login, register, loading, error } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!username || !password) return;
    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
      navigate("/");
    } catch (e) {
      // error handled in context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded shadow w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{isRegister ? "Register" : "Login"}</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        {submitted && !username && <span className="text-red-500 text-xs">Username required</span>}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        />
        {submitted && !password && <span className="text-red-500 text-xs">Password required</span>}
        {error && <div className="text-red-500 text-xs">{error}</div>}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-2" disabled={loading}>
          {loading ? "Loading..." : isRegister ? "Register" : "Login"}
        </button>
        <button type="button" className="text-blue-600 dark:text-blue-400 text-xs mt-2" onClick={() => setIsRegister(r => !r)}>
          {isRegister ? "Already have an account? Login" : "No account? Register"}
        </button>
      </form>
    </div>
  );
};

export default Login; 