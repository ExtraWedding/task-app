import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js'
import userRouter from './routes/userRoute.js'
import taskRouter from './routes/taskRoute.js'
import "./scheduler.js";

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// DB Conneted
connectDB();

//  Routes
app.use("/api/user", userRouter);
app.use("/api/tasks",taskRouter)

app.get('/', (req, res) => {
  res.send('API WORKING: MADE BY WISNU IBNU MUTTAQIEM');
})

app.listen(port, () => {
  console.log(`Server Started on http://localhost:${port}`)
})