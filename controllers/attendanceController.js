import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';

export const markAttendance = async (req, res, next) => {
  try {
    const { employee_id, date, status } = req.body;

    const employee = await Employee.findOne({
      employee_id,
    }).lean();

    if (!employee) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: `Employee with ID ${employee_id} not found`,
      });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      employee_id,
      date: attendanceDate,
    });

    if (existing) {
      return res.status(409).json({
        error: 'DuplicateError',
        message: `Attendance already marked for employee ${employee_id} on ${date}`,
      });
    }

    const attendance = await Attendance.create({
      employee_id,
      date: attendanceDate,
      status,
      created_at: new Date(),
    });

    console.log(`Attendance marked: ${employee_id} - ${date} - ${status}`);

    const formattedDate = attendanceDate.toISOString().split('T')[0];

    res.status(201).json({
      _id: attendance._id.toString(),
      employee_id: attendance.employee_id,
      employee_name: employee.full_name,
      date: formattedDate,
      status: attendance.status,
      created_at: attendance.created_at,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'DuplicateError',
        message: `Attendance already marked for this employee on ${req.body.date}`,
      });
    }
    console.error('Error marking attendance:', error);
    next(error);
  }
};

export const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { employee_id } = req.params;
    const { start_date, end_date } = req.query;

    const employee = await Employee.findOne({
      employee_id,
    }).lean();

    if (!employee) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: `Employee with ID ${employee_id} not found`,
      });
    }

    const query = { employee_id };

    if (start_date || end_date) {
      query.date = {};
      if (start_date) {
        const start = new Date(start_date);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .lean();

    const attendanceList = attendanceRecords.map((att) => ({
      _id: att._id.toString(),
      employee_id: att.employee_id,
      employee_name: employee.full_name,
      date: att.date.toISOString().split('T')[0],
      status: att.status,
      created_at: att.created_at,
    }));

    res.json({
      attendance: attendanceList,
      total: attendanceList.length,
    });
  } catch (error) {
    console.error('Error getting employee attendance:', error);
    next(error);
  }
};

export const getDailyAttendance = async (req, res, next) => {
  try {
    const { date } = req.params;

    const attendanceDate = new Date(date);
    if (isNaN(attendanceDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    attendanceDate.setHours(0, 0, 0, 0);

    const endDate = new Date(attendanceDate);
    endDate.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      date: {
        $gte: attendanceDate,
        $lte: endDate,
      },
    })
      .sort({ created_at: -1 })
      .lean();

    const attendanceList = [];

    for (const att of attendanceRecords) {
      const employee = await Employee.findOne({
        employee_id: att.employee_id,
        is_deleted: false,
      }).lean();

      attendanceList.push({
        _id: att._id.toString(),
        employee_id: att.employee_id,
        employee_name: employee ? employee.full_name : null,
        date: att.date.toISOString().split('T')[0],
        status: att.status,
        created_at: att.created_at,
      });
    }

    res.json({
      attendance: attendanceList,
      total: attendanceList.length,
    });
  } catch (error) {
    console.error('Error getting daily attendance:', error);
    next(error);
  }
};

export const getAttendanceStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    // Build date query
    const dateQuery = {};
    if (start_date) {
      const start = new Date(start_date);
      start.setHours(0, 0, 0, 0);
      dateQuery.$gte = start;
    }
    if (end_date) {
      const end = new Date(end_date);
      end.setHours(23, 59, 59, 999);
      dateQuery.$lte = end;
    }

    const query = dateQuery.$gte || dateQuery.$lte ? { date: dateQuery } : {};

    const totalRecords = await Attendance.countDocuments(query);

    const presentCount = await Attendance.countDocuments({
      ...query,
      status: 'present',
    });

    const absentCount = await Attendance.countDocuments({
      ...query,
      status: 'absent',
    });

    const totalEmployees = await Employee.countDocuments({});

    const employeesWithAttendance = await Attendance.distinct('employee_id', query);

    res.json({
      total_records: totalRecords,
      present_count: presentCount,
      absent_count: absentCount,
      total_employees: totalEmployees,
      employees_with_attendance: employeesWithAttendance.length,
    });
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    next(error);
  }
};

export const getEmployeeAttendanceStats = async (req, res, next) => {
  try {
    const { employee_id } = req.params;
    const { start_date, end_date } = req.query;

    const employee = await Employee.findOne({
      employee_id,
    }).lean();

    if (!employee) {
      return res.status(404).json({
        error: 'NotFoundError',
        message: `Employee with ID ${employee_id} not found`,
      });
    }
    const query = { employee_id };

    if (start_date || end_date) {
      query.date = {};
      if (start_date) {
        const start = new Date(start_date);
        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }
      if (end_date) {
        const end = new Date(end_date);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const totalRecords = await Attendance.countDocuments(query);

    const presentCount = await Attendance.countDocuments({
      ...query,
      status: 'present',
    });

    const absentCount = await Attendance.countDocuments({
      ...query,
      status: 'absent',
    });

    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .lean();

    const attendanceList = attendanceRecords.map((att) => ({
      _id: att._id.toString(),
      date: att.date.toISOString().split('T')[0],
      status: att.status,
    }));

    res.json({
      employee_id,
      employee_name: employee.full_name,
      total_records: totalRecords,
      present_count: presentCount,
      absent_count: absentCount,
      attendance: attendanceList,
    });
  } catch (error) {
    console.error('Error getting employee attendance stats:', error);
    next(error);
  }
};