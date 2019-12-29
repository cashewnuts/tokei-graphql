const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema/schema')

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}))

const port = 4000
app.listen(port, () => {
  console.log(`now listening for requests on port ${port}`)
})

