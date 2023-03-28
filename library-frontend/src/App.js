import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import LoginForm from "./components/Login"
import NewBook from "./components/NewBook"

const LogoutBtn = ({ setPage }) => {
  const logout = (event) => {
    localStorage.removeItem("user-token")
    setPage("login")
  }
  return <button onClick={(e) => logout(e)}>Logout</button>
}

const LoggedInBtns = ({ setPage }) => {
  return (
    <>
      <button onClick={() => setPage("add")}>add book</button>
      <LogoutBtn setPage={setPage} />
    </>
  )
}

const App = () => {
  const [page, setPage] = useState("authors")

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {window.localStorage.getItem("user-token") ? (
          <LoggedInBtns setPage={setPage} />
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <LoginForm show={page === "login"} setPage={setPage} />
    </div>
  )
}

export default App
