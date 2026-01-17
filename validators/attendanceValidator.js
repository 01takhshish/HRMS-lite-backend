import { z } from 'zod';

const employeeIdSchema = z
  .string()
  .regex(/^EMP\d{3,}$/, 'Employee ID must be in format EMP001, EMP002, etc.');

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (dateString) => {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return false;
      
      const [year, month, day] = dateString.split('-').map(Number);
      const checkDate = new Date(year, month - 1, day);
      return (
        checkDate.getFullYear() === year &&
        checkDate.getMonth() === month - 1 &&
        checkDate.getDate() === day
      );
    },
    { message: 'Invalid date' }
  )
  .refine(
    (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date <= today;
    },
    { message: 'Attendance date cannot be in the future' }
  );

const attendanceStatusSchema = z.enum(['present', 'absent'], {
  errorMap: () => ({ message: 'Status must be either "present" or "absent"' }),
});

export const markAttendanceSchema = z.object({
  body: z.object({
    employee_id: employeeIdSchema,
    date: dateSchema,
    status: attendanceStatusSchema,
  }),
});

export const getEmployeeAttendanceSchema = z.object({
  params: z.object({
    employee_id: employeeIdSchema,
  }),
  query: z.object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .optional(),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .optional(),
  }).refine(
    (data) => {
      if (!data.start_date || !data.end_date) return true;
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return start <= end;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['end_date'],
    }
  ),
});

export const getDailyAttendanceSchema = z.object({
  params: z.object({
    date: dateSchema,
  }),
});