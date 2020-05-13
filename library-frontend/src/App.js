
import React, { useState, useEffect } from 'react'
import { useApolloClient, useSubscription, useQuery } from '@apollo/client'
import { ALL_BOOKS, BOOK_ADDED, ME, ALL_AUTHORS } from './queries'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

const App = () => {
  const [page, setPage] = useState('authors')
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const books = useQuery(ALL_BOOKS)
  const user = useQuery(ME)
  const authors = useQuery(ALL_AUTHORS)
  const client = useApolloClient()

  useEffect(() => {
    const token = localStorage.getItem('library-user-token')
    if ( token ) {
      setToken(token)
    }
  }, [])

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) =>
      set.map(p => p.id).includes(object.id)

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) }
      })
    }
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      const message = `
        New book added called ${addedBook.title}
        published by ${addedBook.author.name}
        originally in ${addedBook.published}
      `
      window.alert(message)
      updateCacheWith(addedBook)
    }
  })

  const logout = (event) => {
    event.preventDefault()
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const notify = (message) => {
    setError(message)
    setTimeout(() => {
      setError(null)
    }, 10000)
  }

  if(books.loading || user.loading || authors.loading) {
    return <div>...loading</div>
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token && <button onClick={() => setPage('recommendations')}>recommendations</button>}
        {token && <button onClick={logout}>logout</button>}
        {!token && <button onClick={() => setPage('login')}>login</button>}
      </div>

      <div>{error}</div>

      <Authors
        token={token}
        show={page === 'authors'}
        setError={notify}
        authors={authors.data.allAuthors} />

      <Books
        books={books.data.allBooks}
        show={page === 'books'} />

      {token && <NewBook
        show={page === 'add'}
        setError={notify}
        updateCacheWith={updateCacheWith} />}

      <LoginForm
        setError={notify}
        show={page === 'login'}
        setToken={setToken} />

      {token && <Recommendations
        show={page === 'recommendations'}
        books={books.data.allBooks}
        me={user.data.me} />}

    </div>
  )
}

export default App
