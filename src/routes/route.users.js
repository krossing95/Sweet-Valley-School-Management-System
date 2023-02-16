import express from 'express'
import UserControllers from '../controllers/controller.users.js'
import { ObjectId } from 'bson'

const userRoute = express.Router()

const { fetchUsers, userRegistration, resendVerificationLink, verifyUser,
    passwordRecovery, passwordReset, firstStepUserLogin, secondStepUserLogin,
    fetchUser, updateUser, deleteUser
} = UserControllers()

userRoute.get('/', fetchUsers)
userRoute.get('/user', fetchUser)
userRoute.patch('/', updateUser) // add admin_middleware
userRoute.delete('/', deleteUser) // add admin_middleware
userRoute.post('/', userRegistration)
userRoute.post('/resend-verification', resendVerificationLink)
userRoute.patch('/verify-user', verifyUser)
userRoute.post('/password-recovery', passwordRecovery)
userRoute.patch('/password-reset', passwordReset)
userRoute.post('/login/v1', firstStepUserLogin)
userRoute.post('/login/v2', secondStepUserLogin)
export default userRoute