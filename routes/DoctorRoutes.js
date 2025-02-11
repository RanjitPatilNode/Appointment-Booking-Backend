const express = require('express');
const Router = express.Router();

const DoctoreController = require('../controllers/DoctorController');

Router.post('/createDoctor/', DoctoreController.createDoctor);
Router.get('/getAllDoctors/', DoctoreController.getAllDoctors);
Router.post('/createPatient/', DoctoreController.createPatient);
Router.get('/getAllAppointments/', DoctoreController.getAllAppointments);
// Router.put('/updatePatient/', DoctoreController.updatePatient);
Router.put('/updatePatient/:patientId', DoctoreController.updatePatient);


Router.put('/updateDoctor/', DoctoreController.updateDoctor);
Router.delete('/deletePatient/', DoctoreController.deletePatient);
Router.delete('/deleteDoctor/', DoctoreController.deleteDoctor);
Router.get('/getDashboardStats/', DoctoreController.getDashboardStats);
Router.post('/LoginApis', DoctoreController.LoginApis  )






module.exports = Router;

