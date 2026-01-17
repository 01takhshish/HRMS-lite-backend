import { z } from 'zod';

// Employee ID validation - format: EMP001, EMP002, etc.
const employeeIdSchema = z
  .string()
  .regex(/^EMP\d{3,}$/, 'Employee ID must be in format EMP001, EMP002, etc.');

// Employee creation schema
export const createEmployeeSchema = z.object({
  body: z.object({
    full_name: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters')
      .trim()
      .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
    email: z
      .string()
      .email('Invalid email format')
      .toLowerCase()
      .trim()
      .max(255, 'Email must not exceed 255 characters'),
    department: z
      .string()
      .min(2, 'Department must be at least 2 characters')
      .max(50, 'Department must not exceed 50 characters')
      .trim()
      .regex(/^[a-zA-Z0-9\s&-]+$/, 'Department contains invalid characters'),
  }),
});

// Employee update schema (same as create for now, can be modified later)
export const updateEmployeeSchema = createEmployeeSchema;

// Get employee by ID schema
export const getEmployeeSchema = z.object({
  params: z.object({
    employee_id: employeeIdSchema,
  }),
});

export const deleteEmployeeSchema = getEmployeeSchema;

export const listEmployeesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .pipe(z.number().int().min(1, 'Page must be at least 1')),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .pipe(z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100')),
    search: z
      .string()
      .optional()
      .transform((val) => val?.trim())
      .pipe(z.string().max(100, 'Search term too long').optional()),
    department: z
      .string()
      .optional()
      .transform((val) => val?.trim())
      .pipe(z.string().max(50, 'Department name too long').optional()),
  }),
});