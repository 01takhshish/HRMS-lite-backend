import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import { validate } from '../validators/validate.js';
import { markAttendanceSchema, getEmployeeAttendanceSchema, getDailyAttendanceSchema } from '../validators/attendanceValidator.js';

const router = express.Router();

router.post('/attendance', validate(markAttendanceSchema), attendanceController.markAttendance);

router.get('/attendance/employee/:employee_id', validate(getEmployeeAttendanceSchema), attendanceController.getEmployeeAttendance);

router.get('/attendance/date/:date', validate(getDailyAttendanceSchema), attendanceController.getDailyAttendance);

router.get('/attendance/stats', attendanceController.getAttendanceStats);

router.get('/attendance/employee/:employee_id/stats', validate(getEmployeeAttendanceSchema), attendanceController.getEmployeeAttendanceStats);

export default router;