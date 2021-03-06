const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const path = require("path");
const db = require("./config/connection");
//const routes = require('./routes');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;
console.log(process.env.MONGODB_URI);

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });

  await server.start();
  server.applyMiddleware({ app, cors: false });
};

startServer();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

//app.use(routes);

db.once("open", () => {
  app.listen(PORT, () =>
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`)
  );
});
