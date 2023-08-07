import express from "express";
import { pointRoutes } from "./routes/point-routes.js";
import { postRoutes } from "./routes/post-routes.js";

const PORT = process.env.PORT || 8080;

const exp = express();

exp.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

exp.use(express.json())

exp.use(pointRoutes);
exp.use(postRoutes);

exp.listen(PORT, () => {
  console.log(`Server is started on post ${PORT}`);
})