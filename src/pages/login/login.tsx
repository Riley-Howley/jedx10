// src/pages/Login.tsx
import { useState } from "react"
import { supabase } from "../../lib/superbase"


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else window.location.href = "/dashboard"
  }

  return (
    <div style={{color: "white"}}>
      <h1>Login</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button onClick={handleLogin}>Log in</button>
      {error && <p>{error}</p>}
    </div>
  )
}
