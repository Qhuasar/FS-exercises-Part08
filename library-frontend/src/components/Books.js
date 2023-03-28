import { useQuery } from "@apollo/client"
import { useEffect, useState } from "react"
import { ALL_BOOKS } from "../queries"

const Books = (props) => {
  const [genres, setGenres] = useState([])
  const result = useQuery(ALL_BOOKS)

  const fetchGenre = (event, genre) => {
    event.preventDefault()
    result.refetch({ genre })
  }

  useEffect(() => {
    if (!result.loading) {
      result.data.allBooks.forEach((book) => {
        if (book.genres) {
          book.genres.forEach((genre) => {
            if (!genres.includes(genre)) {
              setGenres(genres.concat(genre))
            }
          })
        }
      })
    }
  }, [genres, result])

  if (!props.show) {
    return null
  }
  if (result.loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {result.data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={(e) => fetchGenre(e, null)}>All</button>
      {genres.map((genre) => {
        if (!genre) return null
        return (
          <button key={genre} onClick={(e) => fetchGenre(e, genre)}>
            {genre}
          </button>
        )
      })}
    </div>
  )
}

export default Books
