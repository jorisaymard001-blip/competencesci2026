import express, { type Express } from "express";
import cors from "cors";
import router from "./routes";

const app: Express = express();

const configuredOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || configuredOrigins.length === 0 || configuredOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin non autorisée par la politique CORS."));
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
