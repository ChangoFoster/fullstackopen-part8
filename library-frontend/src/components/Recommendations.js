import React, { useState, useEffect } from 'react'

const Recommendations = ({show, books, me}) => {
  const [filter, setFilter] = useState(null)

  useEffect(() => {
    if(me) {
      setFilter(me.favoriteGenre)
    }
  }, [me])  // eslint-disable-line

  if(!show) {
    return null
  }

  return(
    <div>
      <h2>Recommendations</h2>
      <p>
        Books from your favourite genre <strong>{me.favoriteGenre}</strong>
      </p>
      <div>{filter}</div>
      <div>
        {books
          .filter(a => a.genres.indexOf(filter) >= 0)
          .map(b => <div key={b.title}>{b.title}</div>)
        }
      </div>
    </div>
  )
}

export default Recommendations
