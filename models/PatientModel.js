const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    // dateOfBirth: {
    //     type: Date,
    //     required: true
    // },
    mobile: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, "Mobile number must be 10 digits"]
    },
    appointmentTime: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    maritalStatus: {
        type: String,
        enum: ["Single", "Married", "Divorced", "Widowed"],
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },
    patientType: {
        type: String,
        enum: ["New", "Old"],
        required: true
    }
}, { timestamps: true });

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
