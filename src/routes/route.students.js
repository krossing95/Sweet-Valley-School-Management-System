import express from 'express'
import StudentController from '../controllers/controller.students.js'

const studentRoute = express.Router()

const {
    createNewStudent
} = StudentController()

studentRoute.post('/', createNewStudent) // add middleware.admin

export default studentRoute