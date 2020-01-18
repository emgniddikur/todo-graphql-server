declare module 'apollo-server' {
  class ApolloServer {
    constructor(arg: { typeDefs: string; resolvers: object });

    listen(): Function
  }
}
