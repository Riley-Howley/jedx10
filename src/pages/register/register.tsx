// src/pages/Register.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/superbase"

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async () => {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      alert("Check your email for a confirmation link (unless email confirmations are off)")
      navigate("/dashboard")
    }
  }

  return (
    <div style={{color: "white"}} className="max-w-md mx-auto mt-20 p-4 border rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Register</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block w-full mb-2 p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block w-full mb-4 p-2 border rounded"
      />
      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Registering..." : "Register"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}
