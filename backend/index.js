import express from 'express'
import { connectToDatabase } from './database/connection.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth-route.js'
dotenv.config()


const app = express()

const port = 3000

app.get('/', (req,res) => {
    res.send('Hi')
})


//middleware
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use(cookieParser())

connectToDatabase();

app.listen(port, () => {
    console.log(`'server is running on port ${port}`);
    
})