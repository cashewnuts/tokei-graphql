const graphql = require('graphql')
const axios = require('axios')
const querystring = require('querystring');
const _ = require('lodash')

const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLList } = graphql

const INDEX_API = 'https://dashboard.e-stat.go.jp/api/1.0/Json/getIndicatorInfo'

const AnnotationType = new GraphQLObjectType({
  name: 'annotation',
  fields: {
    cycle: { type: GraphQLString },
    regionalRank: { type: GraphQLString },
    isSeasonal: { type: GraphQLString },
    annotation: { type: GraphQLString },
  }
})
const DetailType = new GraphQLObjectType({
  name: 'detail',
  fields: {
    code: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
  }
})
const ClassType = new GraphQLObjectType({
  name: 'class',
  fields: {
    name: { type: GraphQLString },
    sname: { type: GraphQLString },
    statName: { type: GraphQLString },
    unit: { type: GraphQLString },
    indicatorClass: { type: GraphQLString },
    cycle: { type: GraphQLString },
    regionalRank: { type: GraphQLString },
    isSeasonal: { type: GraphQLString },
    from: { type: GraphQLString },
    to: { type: GraphQLString },
  }
})

const IndexType = new GraphQLObjectType({
  name: 'Index',
  fields: () => ({
    id: { type: GraphQLID },
    indicatorCode: { type: GraphQLString },
    indicatorName: { type: GraphQLString },
    indicatorElementName: { type: GraphQLString },
    statName: { type: GraphQLString },
    statCode: { type: GraphQLString },
    details: { type: new GraphQLList(DetailType) },
    classes: { type: new GraphQLList(ClassType) },
    annotations: { type: new GraphQLList(AnnotationType) }
  })
})


const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    index: {
      type: new GraphQLList(IndexType),
      args: { category: { type: GraphQLString }, statCode: { type: GraphQLString }},
      async resolve(parent, args) {
        const { data } = await axios.get(INDEX_API, querystring.stringify({ Category: args.category, StatCode: args.statCode}));
        const results = _.get(data, 'GET_META_INDICATOR_INF.METADATA_INF.CLASS_INF.CLASS_OBJ', 'default');
        const indexes = results.map((result) => {
          let details = _.get(result, 'details.detail', null)
          if (details) {
            details = details.map((d) => ({
              code: d['@code'],
              name: d['@name'],
              description: d['$'],
            }))
          }
          let annotations = _.get(result, 'annotations', null)
          if (annotations) {
            annotations = annotations.map((ann) => ({
              cycle: ann['@cycle'],
              regionalRank: ann['@regionalRank'],
              isSeasonal: ann['@isSeasonal'],
              annotation: ann['@annotation']
            }))
          }
          const classes = result.CLASS.map((cls) => {
            const cycle = _.get(cls, 'cycle.@code')
            const regionalRank = _.get(cls, 'RegionalRank.@code')
            const isSeasonal = _.get(cls, 'IsSeasonal.@code')
            return {
              name: cls['@name'],
              sname: cls['@sname'],
              from: cls['@fromDate'],
              to: cls['@toDate'],
              statName: cls['@statName'],
              unit: cls['@unit'],
              cycle,
              regionalRank,
              isSeasonal,
              indicatorClass: '0' + cycle + '0' + regionalRank + '0' + isSeasonal,
            }
          })
          return {
            id: '???',
            indicatorCode: result['@code'],
            indicatorName: result['@name'],
            statCode: result['@name'],
            statName: result['@name'],
            details,
            annotations,
            classes,
          }
        })
        return indexes;
      },
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
})

