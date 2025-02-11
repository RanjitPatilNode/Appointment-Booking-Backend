const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    speciality: {
        type: String,
        required: true
    },
    consultingTime: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
