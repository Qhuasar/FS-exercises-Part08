import { useMutation, useQuery } from "@apollo/client"
import { useState } from "react"
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries"

const Authors = (props) => {
  const authors = useQuery(ALL_AUTHORS)
  const [name, setName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  if (!props.show) {
    return null
  }
  if (authors.loading) {
    return <div>Loading...</div>
  }

  const handleUpdate = (e) => {
    e.preventDefault()
    if (!(name === null)) {
      editAuthor({ variables: { name, setBornTo: parseInt(birthDate, 10) } })
      setName("")
      setBirthDate("")
    }
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={(e) => handleUpdate(e)}>
        <h1>Update Birth Date</h1>
        <label>name</label>
        <select value={name} onChange={(e) => setName(e.target.value)}>
          <option value={null}>...</option>
          {authors.data.allAuthors.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
        <p />
        <label>date</label>
        <input
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          type="number"
        ></input>
        <button type="submit">Update</button>
      </form>
    </div>
  )
}

export default Authors
