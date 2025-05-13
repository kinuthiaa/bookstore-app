import express from 'express';
import "dotenv/config";
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from './routes/bookRoutes.js';
import { connDB } from './lib/db.js';

//port setup
const app = express();
const PORT = process.env.PORT || 3000;


//routes
app.use(express.json());
app.use(cors());


//routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);



//handle running ports and check if the port is functional
app.listen(PORT, () => {
    console.log(`good morning from port ${PORT} 🌄`);
    connDB();
});