const graphql = require('graphql')

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID } = graphql

// dummy data
const books = [
  { name: 'Name of the Wind', genre: 'Fantsy', id: '1' },
  { name: 'The Final Empire', genre: 'Fantsy', id: '2' },
  { name: 'The Long Earth', genre: 'Sci-Fi', id: '3' },
]

const BookType = new GraphQLObjectType({
  name: 'Book',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
  })
})


const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        console.log(typeof args.id)
        return books.find((b) => b.id === args.id)
      },
    },
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
})

