import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const LoginForm = ({setError, setToken, show}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      if(error.graphQLErrors && error.graphQLErrors[0]){
        setError(error.graphQLErrors[0].message)
      } else {
        setError('Undefined error')
      }
    },
  })

  useEffect(() => {
    if (result.data) {
     const token = result.data.login.value
     setToken(token)
     localStorage.setItem('library-user-token', token)
    }
  }, [result.data]) // eslint-disable-line

  const submit = (event) => {
    event.preventDefault()

    login({
      variables: { username, password }
    })

    setUsername('')
    setPassword('')
  }

  if (!show) {
    return null
  }

  return(
    <div>
      <form onSubmit={submit}>
        <label> Username:
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </label>
        <br />
        <label> Password:
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
        />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default LoginForm
