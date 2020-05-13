const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')



mongoose.set('useFindAndModify', false)

const MONGODB_URI = "mongodb+srv://fullstack:fullstackpassword@cluster0-ioezy.mongodb.net/library-app?retryWrites=true&w=majority"

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => { console.log('connected to MongoDB') })
  .catch((error) => { console.log('error connection to MongoDB:', error.message) })

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const typeDefs = gql`
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(name: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }

  type Subscription {
    bookAdded: Book!
  }
`
const { PubSub } = require('apollo-server')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
      if(!args.genre) {
        return Book.find({})
          .populate('author', { name: 1, born: 1, id: 1 })
      }

      return Book.find({ genres: { $in: args.genre } })
        .populate('author', { name: 1, born: 1, id: 1 })
    },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => context.currentUser,
  },
  Author: {
    name: (root) => root.name,
    born: (root) => root.born,
    bookCount: (root) => root.books.length,
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if(!context.currentUser) {
        throw new AuthenticationError("Please log in", {
          invalidArgs: args,
        })
      }

      if(!args.title || args.title.length < 2) {
        throw new UserInputError("You must enter a title at least 2 characters long", {
          invalidArgs: args.title,
        })
      }

      if(!args.author || args.author.length < 4) {
        throw new UserInputError("You must enter an author name at least 2 characters long", {
          invalidArgs: args.author,
        })
      }

      if(!args.published || args.published < 1000 || args.published > 2050) {
        throw new UserInputError("You must enter a real published year", {
          invalidArgs: args.published,
        })
      }

      if(!args.genres || args.genres.length < 0) {
        throw new UserInputError("You must enter at least one genre", {
          invalidArgs: args.genres,
        })
      }

      let author = await Author.findOne({ name: args.author })

      if(!author) {
        author = new Author({ name: args.author })
        await author.save()
      }

      const book = new Book({ ...args, author: author._id })

      try {
        await book.save()
        await book.populate('author', { name: 1, born: 1, id: 1 }).execPopulate()
        author.books = author.books.concat(book._id)
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book})

      return book
    },
    editAuthor: async (root, args, context) => {
      if(!context.currentUser) {
        throw new AuthenticationError("Please log in", {
          invalidArgs: args,
        })
      }

      if(!args.setBornTo) {
        throw new UserInputError("Born data should be added", {
          invalidArgs: args.setBornTo,
        })
      }

      const author = await Author.findOne({ name: args.name })

      if(!author) {
        throw new UserInputError("Select an existing author", {
          invalidArgs: args,
        })
      }

      author.born = args.setBornTo

      try {
        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username })
      try {
       await user.save()
     }
     catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})
