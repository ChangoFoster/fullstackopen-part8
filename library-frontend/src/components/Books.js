import React, { useState, useEffect } from 'react'
import { useLazyQuery } from '@apollo/client'
import { FIND_BOOKS } from '../queries'

const Books = ({show, books}) => {
  const [getBooks, result] = useLazyQuery(FIND_BOOKS)
  const [genres, setGenres] = useState(null)
  const [genreBooks, setGenreBooks] = useState([])

  useEffect(() => {
    setGenreBooks(books)
  }, []) // eslint-disable-line

  useEffect(() => {
    if (result.data) {
      setGenreBooks(result.data.allBooks)
    }
  }, [result.data])

  useEffect(() => {
    if (books) {
      setGenres([...new Set(books.map(a => a.genres[0]))])
    }
  }, [books])

  const pickGenre = (genre) => {
    getBooks({ variables: { genre: genre } })
  }

  if (!show) {
    return null
  }

  if(result.loading || books.loading) {
    return <div>...loading</div>
  }

  const showGenres = () => {
    return(
      <div>
        {genres && genres.map(genre =>
          <button key={genre} onClick={() => pickGenre(genre)}>{genre}</button>
        )}
        <button onClick={() => pickGenre(null)}>All genres</button>
      </div>
    )
  }

  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
            <th>genres</th>
          </tr>
          {genreBooks
            .map(a =>
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
                <td>{a.genres.join(', ')}</td>
              </tr>
            )}
        </tbody>
      </table>
      {showGenres()}
    </div>
  )
}

export default Books
