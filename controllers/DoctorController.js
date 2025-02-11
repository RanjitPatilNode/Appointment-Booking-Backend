const jwt = require('jsonwebtoken');
const generateBaseUrl = require("../constants/baseURL").generateBaseUrl;
const generateOTP = require("../constants/GenerateOTP");
const DoctorModel = require("../models/DoctorModel");
const PatientModel = require("../models/PatientModel");



const createDoctor = async (req, res) => {
    try {
        let { name, email, mobile, speciality, consultingTime } = req.body;

        // Individual field validations
        if (!name) {
            return res.status(400).json({ error_code: 400, message: "Doctor name is required" });
        }
        if (!email) {
            return res.status(400).json({ error_code: 400, message: "Email is required" });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error_code: 400, message: "Invalid email format" });
        }
        if (!mobile) {
            return res.status(400).json({ error_code: 400, message: "Mobile number is required" });
        }
        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ error_code: 400, message: "Mobile number must be 10 digits" });
        }
        if (!speciality) {
            return res.status(400).json({ error_code: 400, message: "Speciality is required" });
        }
        if (!consultingTime) {
            return res.status(400).json({ error_code: 400, message: "Consulting time is required" });
        }

        // Check if mobile already exists
        const existingDoctor = await DoctorModel.findOne({ mobile });
        if (existingDoctor) {
            return res.status(409).json({ error_code: 409, message: "Doctor with this mobile number already exists" });
        }

        // Prefix "Dr." to the name if it doesn't already start with it
        if (!name.startsWith("Dr.")) {
            name = `Dr. ${name}`;
        }

        // Create and save new doctor
        const newDoctor = new DoctorModel({ name, email, mobile, speciality, consultingTime });
        await newDoctor.save();

        return res.status(201).json({
            error_code: 201,
            message: "Doctor created successfully",
            data: newDoctor
        });
    } catch (error) {
        console.error("Error creating doctor:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


const getAllDoctors = async (req, res) => {
    try {
        // Fetch all fields by removing the second argument (projection)
        const doctors = await DoctorModel.find({});

        return res.status(200).json({
            error_code: 200,
            message: "Doctors fetched successfully",
            data: doctors
        });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};



// --------------


const createPatient = async (req, res) => {
    try {
        const { name, doctorId, age, dateOfBirth, mobile, appointmentTime, address, maritalStatus, gender, patientType } = req.body;

        // Individual field validations
        if (!name) {
            return res.status(400).json({ error_code: 400, message: "Patient name is required" });
        }
        if (!doctorId) {
            return res.status(400).json({ error_code: 400, message: "Doctor selection is required" });
        }
        if (!age || age < 0) {
            return res.status(400).json({ error_code: 400, message: "Valid age is required" });
        }
        // if (!dateOfBirth) {
        //     return res.status(400).json({ error_code: 400, message: "Date of birth is required" });
        // }
        if (!mobile) {
            return res.status(400).json({ error_code: 400, message: "Mobile number is required" });
        }
        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ error_code: 400, message: "Mobile number must be 10 digits" });
        }
        if (!appointmentTime) {
            return res.status(400).json({ error_code: 400, message: "Appointment time is required" });
        }
        if (!address) {
            return res.status(400).json({ error_code: 400, message: "Address is required" });
        }
        if (!maritalStatus || !["Single", "Married", "Divorced", "Widowed"].includes(maritalStatus)) {
            return res.status(400).json({ error_code: 400, message: "Valid marital status is required" });
        }
        if (!gender || !["Male", "Female", "Other"].includes(gender)) {
            return res.status(400).json({ error_code: 400, message: "Valid gender is required" });
        }
        if (!patientType || !["New", "Old"].includes(patientType)) {
            return res.status(400).json({ error_code: 400, message: "Valid patient type is required" });
        }

        // Convert appointmentTime and dateOfBirth to Date object
        const formattedDOB = new Date(dateOfBirth);
        const formattedAppointmentTime = new Date(appointmentTime);

        // Check if the doctor exists
        const doctorExists = await DoctorModel.findById(doctorId);
        if (!doctorExists) {
            return res.status(404).json({ error_code: 404, message: "Selected doctor does not exist" });
        }

        // Check if mobile number is already registered
        const existingPatient = await PatientModel.findOne({ mobile });
        if (existingPatient) {
            return res.status(409).json({ error_code: 409, message: "Patient with this mobile number already exists" });
        }

        // Check if the doctor already has an appointment at the same date and time
        const existingAppointment = await PatientModel.findOne({
            doctorId,
            appointmentTime: formattedAppointmentTime
        });

        if (existingAppointment) {
            return res.status(409).json({ error_code: 409, message: "This slot is already booked for this doctor" });
        }

        // Create and save new patient
        const newPatient = new PatientModel({
            name,
            doctorId,
            age,
            dateOfBirth: formattedDOB,
            mobile,
            appointmentTime: formattedAppointmentTime,
            address,
            maritalStatus,
            gender,
            patientType
        });

        await newPatient.save();

        return res.status(201).json({
            error_code: 201,
            message: "Patient registered successfully",
            data: newPatient
        });

    } catch (error) {
        console.error("Error creating patient:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


const getAllAppointments = async (req, res) => {
    try {
        const appointments = await PatientModel.find()
            .populate("doctorId", "name speciality email mobile") // Populating doctor details
            .sort({ appointmentTime: 1 }); // Sorting by appointment time

        if (!appointments.length) {
            return res.status(404).json({ error_code: 404, message: "No appointments found" });
        }

        return res.status(200).json({
            error_code: 200,
            message: "Appointments fetched successfully",
            data: appointments
        });

    } catch (error) {
        console.error("Error fetching appointments:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


const updatePatient = async (req, res) => {
    try {
        const { patientId, name, doctorId, dateOfBirth, mobile, appointmentTime, address, maritalStatus, gender, patientType } = req.body;

        console.log("🔍 Incoming update data:", req.body); // ✅ Debugging incoming data

        // Check if the patient exists
        const patient = await PatientModel.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error_code: 404, message: "Patient not found" });
        }

        // 🔍 Check if the new mobile number is already in use (but not by the same patient)
        if (mobile && mobile !== patient.mobile) {
            const existingPatient = await PatientModel.findOne({ mobile });
            if (existingPatient) {
                return res.status(400).json({ error_code: 400, message: "Mobile number already in use by another patient." });
            }
        }

        // Apply updates
        if (name) patient.name = name;
        if (doctorId) patient.doctorId = doctorId;
        if (dateOfBirth) patient.dateOfBirth = new Date(dateOfBirth);
        if (mobile) patient.mobile = mobile;
        if (appointmentTime) patient.appointmentTime = new Date(appointmentTime);
        if (address) patient.address = address;
        if (maritalStatus) patient.maritalStatus = maritalStatus;
        if (gender) patient.gender = gender;
        if (patientType) patient.patientType = patientType;

        console.log("📝 Updated patient object:", patient); // ✅ Debugging

        // Save updated patient data
        await patient.save();

        return res.status(200).json({
            error_code: 200,
            message: "Appointment updated successfully",
            data: patient
        });

    } catch (error) {
        console.error("❌ Error updating appointment:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};




const updateDoctor = async (req, res) => {
    try {
        const { doctorId } = req.body;
        let { name, email, mobile, speciality, consultingTime } = req.body;

        if (!doctorId) {
            return res.status(400).json({
                error_code: 400, message: "Doctor ID Required"
            });
        }

        // Check if doctor exists
        const doctor = await DoctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error_code: 404, message: "Doctor not found" });
        }

        // Field validations
        if (name && !name.startsWith("Dr.")) {
            name = `Dr. ${name}`;
        }
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error_code: 400, message: "Invalid email format" });
        }
        if (mobile && !/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ error_code: 400, message: "Mobile number must be 10 digits" });
        }

        // Check if the updated mobile number is already used by another doctor
        if (mobile) {
            const existingDoctor = await DoctorModel.findOne({ mobile, _id: { $ne: doctorId } });
            if (existingDoctor) {
                return res.status(409).json({ error_code: 409, message: "Another doctor is already registered with this mobile number" });
            }
        }

        // Update doctor details
        const updatedDoctor = await DoctorModel.findByIdAndUpdate(
            doctorId,
            { name, email, mobile, speciality, consultingTime },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            error_code: 200,
            message: "Doctor updated successfully",
            data: updatedDoctor
        });

    } catch (error) {
        console.error("Error updating doctor:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};


const deletePatient = async (req, res) => {
    try {
        const { patientId } = req.body;

        // Check if the patient exists
        const patient = await PatientModel.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error_code: 404, message: "Patient not found" });
        }

        // Delete the patient
        await PatientModel.findByIdAndDelete(patientId);

        return res.status(200).json({
            error_code: 200,
            message: "Patient deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting patient:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        const { doctorId } = req.body;

        if (!doctorId) {
            return res.status(404).json({ error_code: 404, message: "doctorId is required" });
        }
        const doctor = await DoctorModel.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ error_code: 404, message: "Doctor not found" });
        }

        // Delete the doctor
        await DoctorModel.findByIdAndDelete(doctorId);

        return res.status(200).json({
            error_code: 200,
            message: "Doctor deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting doctor:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        // Count total doctors
        const totalDoctors = await DoctorModel.countDocuments();

        // Count total patients
        const totalPatients = await PatientModel.countDocuments();

        // Count total appointments (Assuming each patient has one appointment)
        const totalAppointments = await PatientModel.countDocuments({ appointmentTime: { $exists: true } });

        return res.status(200).json({
            error_code: 200,
            message: "Dashboard data fetched successfully",
            data: {
                totalDoctors,
                totalPatients,
                totalAppointments
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};

const LoginApis = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Static credentials
        const STATIC_EMAIL = "admin@gmail.com";
        const STATIC_PASSWORD = "admin@123";

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({ error_code: 400, message: "Email and password are required" });
        }

        // Check static email and password
        if (email !== STATIC_EMAIL || password !== STATIC_PASSWORD) {
            return res.status(401).json({ error_code: 401, message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email, role: "admin" },
            process.env.JWT_SECRET || "your_secret_key",
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            error_code: 200,
            message: "Login successful",
            data: {
                email,
                role: "admin",
                token
            }
        });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ error_code: 500, message: "Internal server error" });
    }
};




module.exports = {
    createDoctor,
    getAllDoctors,
    createPatient,
    getAllAppointments,
    updatePatient,
    updateDoctor,
    deletePatient,
    deleteDoctor,
    getDashboardStats,
    LoginApis,

};










