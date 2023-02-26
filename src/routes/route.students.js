import express from 'express'
import StudentController from '../controllers/controller.students.js'

const studentRoute = express.Router()

const {
    createNewStudent, fetchStudents, fetchStudent, fetchStudentsByParent, updateStudentData,
    createParentData, fetchParentInformation, removeParentInformation, saveEmergencyContact,
    fetchContacts, removeContactByStudentId, removeContactByContactId
} = StudentController()

studentRoute.post('/', createNewStudent) // add middleware.admin
studentRoute.get('/', fetchStudents)
studentRoute.get('/student', fetchStudent)
studentRoute.get('/students-by-parent', fetchStudentsByParent)
studentRoute.patch('/', updateStudentData) // add middleware.admin

// parent_info
studentRoute.post('/parent-information', createParentData) // add middleware.admin
studentRoute.get('/parent-information', fetchParentInformation)// add middleware.user
studentRoute.delete('/parent-information', removeParentInformation) //add middleware.admin

// contacts
studentRoute.post('/emergency-contacts', saveEmergencyContact) //add middleware.admin
studentRoute.get('/emergency-contacts', fetchContacts)
studentRoute.delete('/emergency-contacts', removeContactByStudentId) //add middleware.admin
studentRoute.patch('/emergency-contacts', removeContactByContactId) //add middleware.admin
export default studentRoute