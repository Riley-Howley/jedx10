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
    <>
      <div className={styles.registerContainer}>
        <div className={styles.col}>
          <img src={brandImage} className={styles.brandImage} />
          <h1>Create Your Account</h1>
          <form>
            <input 
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button text="Register" primary onClick={() => {
                console.log("Register")
                // handleRegister()
              }} />
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
