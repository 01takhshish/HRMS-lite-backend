import mongoose from '../database.js';

const attendanceSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent'],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ employee_id: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

