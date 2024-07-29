import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";
import itemRoutes from "./routes/itemRoutes";

const app = express();

app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api", itemRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
