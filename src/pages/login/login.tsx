// src/pages/Login.tsx
import { useState } from "react"
import { supabase } from "../../lib/superbase"
import brandImage from "../../assets/logo.svg";
import Button from "../../components/button/button";
import Footer from "../footer/footer";
import styles from './login.module.css'
import Loading from "../../components/loading/loading";


export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else window.location.href = "/dashboard/home"
  }

  return (
    <>
      <div className={styles.loginContainer}>
        {loading ? (
          <Loading />
        ) : (
          <div className={styles.col}>
            <img src={brandImage} className={styles.brandImage} />
            <h1>Welcome Back</h1>
            <form>
              {error && <p style={{color: 'red'}}>{error}</p>}
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
                handleLogin();
              }} />
            </form>
          </div>
        )}

      </div>
      <Footer />
    </>
  )
}
