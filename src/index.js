import "dotenv/config";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import http from "http";

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.info(`Server running on http://localhost:${PORT} 🚀`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error", error);
    process.exit(1);
  });
