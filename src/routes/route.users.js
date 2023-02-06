import express from 'express'
import UserControllers from '../controllers/controller.users.js'

const userRoute = express.Router()

const { fetchUsers, userRegistration } = UserControllers()

userRoute.get('/', fetchUsers)
userRoute.post('/', userRegistration)

export default userRoute