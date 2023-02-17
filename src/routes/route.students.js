import express from 'express'
import StudentController from '../controllers/controller.students.js'

const studentRoute = express.Router()

const {
    createNewStudent, fetchStudents, fetchStudent
} = StudentController()

studentRoute.post('/', createNewStudent) // add middleware.admin
studentRoute.get('/', fetchStudents)
studentRoute.get('/student', fetchStudent)
export default studentRoute