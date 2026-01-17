import express from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { validate } from '../validators/validate.js';
import { createEmployeeSchema, getEmployeeSchema, deleteEmployeeSchema, listEmployeesSchema,} from '../validators/employeeValidator.js';

const router = express.Router();

router.post('/employees', validate(createEmployeeSchema), employeeController.createEmployee);

// List employees with pagination
router.get( '/employees', validate(listEmployeesSchema), employeeController.listEmployees);

router.get('/employees/all', employeeController.getAllEmployees);

router.get( '/employees/:employee_id', validate(getEmployeeSchema), employeeController.getEmployee);

router.delete( '/employees/:employee_id', validate(deleteEmployeeSchema), employeeController.deleteEmployee);

export default router;