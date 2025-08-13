// src/pages/Login.tsx
import { useState } from "react"
import { supabase } from "../../lib/superbase"
import brandImage from "../../assets/logo.svg";
import Button from "../../components/button/button";
import Footer from "../footer/footer";
import styles from './login.module.css'


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [ ,setError] = useState("")

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else window.location.href = "/dashboard/home"
    console.log("Error Message", error)
  }

  return (
    <>
      <div className={styles.loginContainer}>
        <div className={styles.col}>
          <img src={brandImage} className={styles.brandImage} />
          <h1>Welcome Back</h1>
          <form>
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
              <Button text="login" primary onButtonClick={() => {
                console.log("Login");
                handleLogin();  
              }} />
          </form>
        </div>
      </div>
      <Footer />
    </>
  )
}
