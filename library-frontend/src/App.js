import { useApolloClient, useSubscription } from "@apollo/client"
import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import LoginForm from "./components/Login"
import NewBook from "./components/NewBook"
import { ALL_BOOKS, BOOK_ADDED } from "./queries"

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

const updateCache = (cache, query, bookAdded) => {
  const uniqByTitle = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(bookAdded)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState("authors")
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const bookAdded = data.data.bookAdded
      alert(`${bookAdded.title} was added`)
      updateCache(client.cache, { query: ALL_BOOKS }, bookAdded)
    },
  })

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
