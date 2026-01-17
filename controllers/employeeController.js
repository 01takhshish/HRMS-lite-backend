import Employee from '../models/Employee.js';

const generateEmployeeId = async () => {
  try {
     const employees = await Employee.find({
      employee_id: { $regex: /^EMP\d+$/ },
    })
      .select('employee_id')
      .lean();

    if (employees.length === 0) {
      return 'EMP001';
    }

    const numbers = employees
      .map((emp) => {
        const match = emp.employee_id.match(/^EMP(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num) => !isNaN(num) && num > 0);

    if (numbers.length === 0) {
      return 'EMP001';
    }

    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
  
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    
    return `EMP${paddedNumber}`;
  } catch (error) {
    console.error('Error generating employee ID:', error);
    const timestamp = Date.now().toString().slice(-6);
    return `EMP${timestamp}`;
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const { full_name, email, department } = req.body;

    const existing = await Employee.findOne({
      email: email.toLowerCase(),
    });

    if (existing) {
      return res.status(409).json({
        error: 'DuplicateError',
        message: `Employee with email ${email} already exists`,
      });
    }

    const employee_id = await generateEmployeeId();

    const employee = await Employee.create({
      employee_id,
      full_name,
      email: email.toLowerCase(),
      department,
      created_at: new Date(),
    });

    console.log(`Employee created: ${employee_id} - ${email}`);

    res.status(201).json({
      _id: employee._id.toString(),
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      email: employee.email,
      department: employee.department,
      created_at: employee.created_at,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'DuplicateError',
        message: 'Employee with this email or ID already exists',
      });
    }
    console.error('Error creating employee:', error);
    next(error);
  }
};

export const listEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const department = req.query.department;

    const query = {};

    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employee_id: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    const total = await Employee.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const employees = await Employee.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const employeeList = employees.map((emp) => ({
      _id: emp._id.toString(),
      employee_id: emp.employee_id,
      full_name: emp.full_name,
      email: emp.email,
      department: emp.department,
      created_at: emp.created_at,
    }));

    res.json({
      employees: employeeList,
      total,
      page,
      limit,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error('Error listing employees:', error);
    next(error);
  }
};

export const getEmployee = async (req, res, next) => {
  try {
    const { employee_id } = req.params;

    const employee = await Employee.findOne({
      employee_id,
    }).lean();

    if (!employee) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: `Employee with ID ${employee_id} not found`,
      });
    }

    res.json({
      _id: employee._id.toString(),
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      email: employee.email,
      department: employee.department,
      created_at: employee.created_at,
    });
  } catch (error) {
    console.error('Error getting employee:', error);
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { employee_id } = req.params;

    const result = await Employee.deleteOne({ employee_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: `Employee with ID ${employee_id} not found`,
      });
    }

    console.log(`Employee deleted: ${employee_id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    next(error);
  }
};

export const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({
    })
      .select('_id employee_id full_name email department')
      .sort({ full_name: 1 })
      .lean();

    const employeeList = employees.map((emp) => ({
      _id: emp._id.toString(),
      employee_id: emp.employee_id,
      full_name: emp.full_name,
      email: emp.email,
      department: emp.department,
    }));

    res.json({
      employees: employeeList,
      total: employeeList.length,
    });
  } catch (error) {
    console.error('Error getting all employees:', error);
    next(error);
  }
};
