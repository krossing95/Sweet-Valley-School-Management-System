import express from 'express'
import StudentController from '../controllers/controller.students.js'

const studentRoute = express.Router()

const {
    createNewStudent, fetchStudents, fetchStudent, fetchStudentsByParent, updateStudentData,
    createParentData, fetchParentInformation
} = StudentController()

studentRoute.post('/', createNewStudent) // add middleware.admin
studentRoute.get('/', fetchStudents)
studentRoute.get('/student', fetchStudent)
studentRoute.get('/students-by-parent', fetchStudentsByParent)
studentRoute.patch('/', updateStudentData) // add middleware.admin

// parent_info
studentRoute.post('/parent-information', createParentData) // add middleware.admin
studentRoute.get('/parent-information', fetchParentInformation)// add middleware.user
export default studentRoute