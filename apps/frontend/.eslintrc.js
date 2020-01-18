const glob = require("glob");
const fs = require("fs");
const gql = require("graphql-tag");
const { buildFederatedSchema } = require("@apollo/federation");
const { graphqlSync, introspectionQuery } = require("graphql");

// We need to remove all fields with an @external directive since federation
// will complain about it being a duplicated field when generating a single schema
function removeExternal(schema, parent = null, key = null) {
  for (const key in schema) {
    if (Array.isArray(schema[key])) {
      for (const nested of schema[key]) {
        removeExternal(nested, schema, key);
      }
    }
  }

  if ("directives" in schema && parent && key) {
    const some = schema.directives.some(
      directive => directive.name.value === "external"
    );

    if (some) {
      parent[key] = parent[key].filter(child => child !== schema);
    }
  }
}

const files = glob
  .sync("../../services/**/*.graphql")
  .map(path => {
    const schema = gql([fs.readFileSync(path, "utf8")]);
    removeExternal(schema);

    return schema;
  })
  .map(schema => ({ typeDefs: schema, resolvers: {} }));

const schema = buildFederatedSchema(files);

module.exports = {
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    es6: true,
    browser: true
  },
  rules: {
    "graphql/template-strings": [
      "error",
      {
        env: "literal",
        schemaJson: graphqlSync(schema, introspectionQuery).data
      }
    ]
  },
  plugins: ["graphql"]
};
