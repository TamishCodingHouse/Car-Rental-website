import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoute.js";
import bookingRouter from "./routes/bookingRoute.js";

// Initialize Express 
const app = express();


// Database connection string
await connectDB();

// Middleware 
app.use(cors());
app.use(express.json());

app.get('/', (req, res)=> res.send("Server is running"))
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/bookings', bookingRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`Server Running on port ${PORT}`))
