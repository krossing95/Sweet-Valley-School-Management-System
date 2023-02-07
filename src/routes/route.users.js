import express from 'express'
import UserControllers from '../controllers/controller.users.js'

const userRoute = express.Router()

const { fetchUsers, userRegistration, resendVerificationLink, verifyUser, passwordRecovery } = UserControllers()

userRoute.get('/', fetchUsers)
userRoute.post('/', userRegistration)
userRoute.post('/resend-verification', resendVerificationLink)
userRoute.patch('/verify-user', verifyUser)
userRoute.post('/password-recovery', passwordRecovery)
export default userRoute