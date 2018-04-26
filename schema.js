const pubsub = require('./pubsub');
const { makeExecutableSchema } = require('graphql-tools');
const data = [
  { id: '1', name: 'superadmin' },
  { id: '2', name: 'admin' },
  { id: '3', name: 'user' },
];

// SCHEMA DEFINITION
const typeDefs = `
type Query {
  roles: [Role]
  role(id: ID!): Role
}
type Subscription {
  roleChanged: Role
}
type Mutation {
  change(id: ID!, name: String!): Role
}
type Role {
  id: ID!
  name: String
}`;

// RESOLVERS
const resolvers = {
  Query: {
    roles: (root, args, context, info) => data,
    role: (root, args, context, info) => {
      return data.find(item => item.id == args.id);
    },
  },
  Subscription: {
    roleChanged: {
      subscribe: () => {
        console.log('roleChanged subscribe!');
        return pubsub.asyncIterator('ROLE_CHANGED');
      },
    },
  },
  Mutation: {
    change: (parent, { id, name }) => {
      const role = data.find(item => item.id == id);
      if (role) {
        role.name = name;
      }
      pubsub.publish('ROLE_CHANGED', {
        roleChanged: role,
      });
      return role;
    },
  },
};

// (EXECUTABLE) SCHEMA
module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
