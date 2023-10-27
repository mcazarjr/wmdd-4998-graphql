import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import PersonScreen from "./screens/PersonScreen.jsx";

import "./index.css";
import App from "./App.jsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/person/:id", element: <PersonScreen /> },
]);

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>
);
