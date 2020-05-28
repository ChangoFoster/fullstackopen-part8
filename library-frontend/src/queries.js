import { gql } from '@apollo/client'

const AUTHOR_DETAILS = gql `
  fragment AuthorDetails on Author {
    name
    born
    id
  }
`

export const ALL_AUTHORS = gql`
  query {
    allAuthors  {
      ...AuthorDetails
      bookCount
    }
  }
  ${AUTHOR_DETAILS}
`

export const ALL_BOOKS = gql`
  query {
    allBooks  {
      title
      author {
        ...AuthorDetails
      }
      published
      genres
    }
  }
  ${AUTHOR_DETAILS}
`

export const FIND_BOOKS = gql`
  query findBooksByGenre($genre: String) {
    allBooks(genre: $genre) {
      title
      author {
        ...AuthorDetails
      }
      published
      genres
      id
    }
  }
  ${AUTHOR_DETAILS}
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      author {
        ...AuthorDetails
      }
      published
      genres
      id
    }
  }
  ${AUTHOR_DETAILS}
`

export const CREATE_BOOK = gql`
  mutation createBook(
    $title: String!,
    $author: String!,
    $published: Int!,
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author {
        ...AuthorDetails
      }
      published
      genres
    }
  }
  ${AUTHOR_DETAILS}
`

export const UPDATE_AUTHOR = gql`
  mutation updateAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name
      setBornTo: $setBornTo
    ) {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`

export const NEW_USER = gql`
  mutation newUser($username: String!, $favoriteGenre: String!){
    createUser(
    	username: $username
    	favoriteGenre: $favoriteGenre
  	) {
      username
      favoriteGenre
      id
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!){
    login(
    	username: $username
    	password: $password
  	) {
      value
    }
  }
`

export const ME = gql`
  query {
    me {
      username
      favoriteGenre
      id
    }
  }
`
