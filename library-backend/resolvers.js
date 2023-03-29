const { GraphQLError } = require("graphql")
const jwt = require("jsonwebtoken")
const Author = require("./models/Author")
const Book = require("./models/Book")
const User = require("./models/User")
const { PubSub } = require("graphql-subscriptions")
const pubsub = new PubSub()

const resolvers = {
  Query: {
    me: (root, args, { currentUser }) => currentUser,
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author })
        return await Book.find({
          author: author._id,
          genres: args.genre,
        }).populate("author")
      }
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        return await Book.find({ author: author._id }).populate("author")
      }
      if (args.genre) {
        return await Book.find({ genres: args.genre }).populate("author")
      }
      return await Book.find({}).populate("author")
    },

    allAuthors: async () => {
      const authors = await Author.find({})
      const books = await Book.find({}).populate("author")
      const returnAuthor = authors.map((author) => {
        const bookCount = books.reduce((total, curr_book) => {
          if (curr_book.author.name === author.name) return total + 1
          return total
        }, 0)
        return {
          name: author.name,
          bookCount,
          id: author._id,
          born: author.born,
        }
      })
      return returnAuthor
    },
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("no valid token", {
          extensions: {
            code: "INVALID_TOKEN",
            invalidArgs: currentUser,
          },
        })
      }
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        try {
          author = new Author({ name: args.author })
        } catch (error) {
          throw new GraphQLError("Validaiton failed", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.author,
              error,
            },
          })
        }
        await author.save()
      }
      try {
        const book = new Book({ ...args, author })
        await book.save()
        pubsub.publish("BOOK_ADDED", { bookAdded: book })
        return book
      } catch (error) {
        throw new GraphQLError("Validaiton failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
            error,
          },
        })
      }
    },

    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("no valid token", {
          extensions: {
            code: "INVALID_TOKEN",
            invalidArgs: currentUser,
          },
        })
      }
      let author = await Author.findOneAndUpdate(
        { name: args.name },
        { born: args.setBornTo },
        { new: true, runValidators: true }
      )
      return author
    },

    createUser: async (root, args) => {
      try {
        const user = new User({ ...args })
        await user.save()
        return user
      } catch (error) {
        throw new GraphQLError("Validaiton failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== "password") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
          },
        })
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.SECRET) }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
}

module.exports = resolvers
