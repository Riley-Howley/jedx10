// src/pages/Register.tsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/superbase"
import Footer from "../footer/footer"
import brandImage from "../../assets/logo.svg";
import styles from './register.module.css'
import Button from "../../components/button/button";

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [, setError] = useState("")

  const handleRegister = async () => {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: "user" } // or "user", "editor", etc.
      }
    })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      alert("Check your email for a confirmation link (unless email confirmations are off)")
      navigate("/dashboard/home")
    }
  }

  return (
    <>
      <div className={styles.registerContainer}>
        {loading ? (
          <h1 style={{ color: 'white' }}>Registering your account ....</h1>
        ) : (
          <div className={styles.col}>
            <img src={brandImage} className={styles.brandImage} />
            <h1>Create Your Account</h1>
            <form>
              <input
                style={{
                  color: 'black'
                }}
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                style={{
                  color: 'black'
                }}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                style={{
                  color: 'black'
                }}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button text="Register" primary onButtonClick={() => {
                handleRegister()
              }} />
            </form>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
