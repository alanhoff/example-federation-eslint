import ApolloClient from "apollo-boost";
import { ApolloProvider, useQuery } from "@apollo/react-hooks";
import { getTopProducts } from "./products.graphql";
import fetch from "isomorphic-unfetch";

const client = new ApolloClient({
  uri: "http://localhost:4000",
  fetch
});

function App() {
  const { loading, data } = useQuery(getTopProducts, {
    variables: {
      limit: 1
    }
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  const product = data.topProducts[0];

  return (
    <p>
      {product.name} for U${product.price}
    </p>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
