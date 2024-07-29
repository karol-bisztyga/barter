import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";
import itemRoutes from "./routes/itemRoutes";

const app = express();

app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api", itemRoutes);

const { SERVER_PORT } = process.env;

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
