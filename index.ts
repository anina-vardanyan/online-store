import express, { Application, Request, Response } from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { parse } from "yaml";
import swaggerUI from "swagger-ui-express";
// ------ Config ------
import { FRONT_URL, PORT, SESSION_SECRET } from "./src/config/config";
// ------ Database ------
import database from "./src/config/database";
// ------ Middleware ------
import handlingMiddleware from "./src/middlewares/handlingMiddleware";
// ------ Routers ------
import deliveryRouter from "./src/routers/deliveryRouter";

(async function () {
  const staticFilesPath = path.join(path.resolve(), "src", "dist");

  const app: Application = express();
  app.use(
    cors({
      origin: FRONT_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
  );
  app.use(express.static(staticFilesPath));
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  database(); // Database start

  app.use("/api/delivery", deliveryRouter);
  app.use(handlingMiddleware); // Internal Server Error

  const setupSwagger = () => {
    const file = parse(
      fs.readFileSync(path.join(path.resolve(), "api.yml"), "utf8")
    );

    app.use("/api/swagger", swaggerUI.serve, swaggerUI.setup(file));
    app.use("/*", (req: Request, res: Response) => {
      res.status(404).send({ message: "404 Not Found" });
    });
  };
  setupSwagger();

  app.listen(PORT, () => console.log(`Server started on port ${PORT}⚡`));
})();