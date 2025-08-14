import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import "dotenv/config";

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cors());

server.use(routes);

// Middleware de tratamento de erros deve vir por último
server.use(errorHandler);

const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
