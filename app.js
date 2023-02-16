import express from 'express'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { APP_OBJECT } from './src/utils/static/index.js'
import userRoute from './src/routes/route.users.js'
import studentRoute from './src/routes/route.students.js'

const { name } = APP_OBJECT

const app = express()
dotenv.config()
const PORT = process.env.PORT || process.env.SVCMSMS_APP_PORT
app.use(helmet())
app.use(cors({
    origin: ['*'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
}))
app.use(cookieParser())
app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json;charset=UTF-8')
    res.header('Access-Control-Allow-Credentials', true)
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
})
app.use(express.json({ limit: '5mb' }))

app.get('/', (req, res) => {
    return res.send(`Welcome to ${name}`)
})
app.use('/api/users', userRoute)
app.use('/api/students', studentRoute)
app.listen(PORT, () => console.log(`${name} is running on port ${PORT}`))