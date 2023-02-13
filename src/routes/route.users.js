import express from 'express'
import UserControllers from '../controllers/controller.users.js'

const userRoute = express.Router()

const { fetchUsers, userRegistration, resendVerificationLink, verifyUser,
    passwordRecovery, passwordReset, firstStepUserLogin, secondStepUserLogin
} = UserControllers()

userRoute.get('/', fetchUsers)
userRoute.post('/', userRegistration)
userRoute.post('/resend-verification', resendVerificationLink)
userRoute.patch('/verify-user', verifyUser)
userRoute.post('/password-recovery', passwordRecovery)
userRoute.patch('/password-reset', passwordReset)
userRoute.post('/login/v1', firstStepUserLogin)
userRoute.post('/login/v2', secondStepUserLogin)
export default userRoute