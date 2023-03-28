import { useMutation } from "@apollo/client"
import { useState } from "react"
import { LOGIN_USER } from "../queries"

const LoginForm = (props) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loginUser] = useMutation(LOGIN_USER)

  const hanldeLogin = (event) => {
    event.preventDefault()
    loginUser({ variables: { username, password } })
      .then((data) => {
        window.localStorage.setItem("user-token", data.data.login.value)
        setUsername("")
        setPassword("")
        props.setPage("authors")
      })
      .catch((error) => console.error(error))
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <form onSubmit={(e) => hanldeLogin(e)}>
        Username:
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        Password:
        <input value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submite">Login</button>
      </form>
    </div>
  )
}

export default LoginForm
