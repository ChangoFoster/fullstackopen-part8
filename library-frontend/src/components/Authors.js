
import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../queries'

const Authors = ({setError, show, token, authors}) => {
  const [born, setBorn] = useState('')
  const [name, setName] = useState('')
  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS } ],
    onError: (error) => {
      if(error.graphQLErrors && error.graphQLErrors[0]){
        setError(error.graphQLErrors[0].message)
      } else {
        setError('Undefined error')
      }
    },
  })

  useEffect(() => {
    if (authors.length > 0) {
      setName(authors[0].name)
    }
  }, [authors])  // eslint-disable-line

  if (!show) {
    return null
  }

  const submit = (event) => {
    event.preventDefault()

    updateAuthor({
      variables: { name: name, setBornTo: born }
    })

    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th>name</th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      {token &&
        <>
          <h3>Update author</h3>
          <form onSubmit={submit}>
            <label>
              Select author:
              <select
                value={name}
                onChange={({ target }) => setName(target.value)}
              >
                {authors.map(a =>
                  <option key={a.name} value={a.name}>{a.name}</option>
                )}
              </select>
            </label>
            <br />
            <input
              type='number'
              value={born}
              onChange={({ target }) => setBorn(Number(target.value))}
            />
            <br />
            <button type="submit">Update author</button>
          </form>
        </>
      }
    </div>
  )
}

export default Authors
