import mongoose from '../database.js';

const employeeSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  full_name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  department: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ employee_id: 1 }, { unique: true });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;

