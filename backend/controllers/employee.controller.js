import Employee from "../models/Employee.model.js";

/* ================= CREATE ================= */
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      employeeCode,
      phone,
      address,
      role,
      wards,
      joiningDate,
    } = req.body;

    const normalizePath = (p) => p?.replace(/\\/g, "/");

    let finalCode = employeeCode?.trim();

    // If employee code is not provided by user, auto-generate next code for this panchayat
    if (!finalCode) {
      const employees = await Employee.find(
        { panchayat: req.user.panchayatId },
        { employeeCode: 1 }
      ).lean();

      let maxNum = 0;
      employees.forEach((emp) => {
        if (emp.employeeCode) {
          const matches = emp.employeeCode.match(/\d+/g);
          if (matches) {
            const num = parseInt(matches[matches.length - 1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      });

      const nextNum = maxNum + 1;
      finalCode = `EMP${String(nextNum).padStart(3, "0")}`;
    }

    const employee = await Employee.create({
      panchayat: req.user.panchayatId,
      name,
      employeeCode: finalCode,
      phone,
      address,
      role,
      wards: Array.isArray(wards) ? wards : [wards],
      dateOfBirth: joiningDate,
      status: "active",
      documents: {
        photo: normalizePath(req.files?.photo?.[0]?.path),
        idProof: normalizePath(req.files?.idProof?.[0]?.path),
        license: normalizePath(req.files?.license?.[0]?.path),
      },
    });

    res.status(201).json(employee);
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.employeeCode || err.message?.includes("employeeCode")) {
        return res.status(400).json({ message: "Employee code already exists in your Panchayat" });
      }
      return res.status(400).json({ message: "Duplicate entry detected. Please check your data." });
    }
    res.status(500).json({ message: err.message });
  }
};

/* ================= LIST ================= */
export const getEmployees = async (req, res) => {


  const employees = await Employee.find({
    panchayat: req.user.panchayatId,
  });



  res.json(employees);
};


/* ================= SINGLE ================= */
export const getEmployeeById = async (req, res) => {
  const employee = await Employee.findOne({
    _id: req.params.id,
    panchayat: req.user.panchayatId,
  });

  if (!employee)
    return res.status(404).json({ message: "Employee not found" });

  res.json(employee);
};

/* ================= UPDATE ================= */
export const updateEmployee = async (req, res) => {
  try {
    const update = { ...req.body };
    const normalizePath = (p) => p?.replace(/\\/g, "/");

    if (req.files) {
      update.documents = {};

      if (req.files.photo?.[0])
        update.documents.photo = normalizePath(req.files.photo[0].path);

      if (req.files.idProof?.[0])
        update.documents.idProof = normalizePath(req.files.idProof[0].path);

      if (req.files.license?.[0])
        update.documents.license = normalizePath(req.files.license[0].path);
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, panchayat: req.user.panchayatId },
      update,
      { new: true }
    );

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    res.json(employee);
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.employeeCode || err.message?.includes("employeeCode")) {
        return res.status(400).json({ message: "Employee code already exists in your Panchayat" });
      }
      return res.status(400).json({ message: "Duplicate entry detected. Please check your data." });
    }
    res.status(500).json({ message: err.message });
  }
};

/* ================= DEACTIVATE ================= */
export const deactivateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      panchayat: req.user.panchayatId,
    });

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    employee.status = "inactive";
    await employee.save();

    res.json({ message: "Employee deactivated" });
  } catch (err) {
    res.status(500).json({ message: "Deactivation failed" });
  }
};

/* ================= ACTIVATE ================= */
export const activateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      _id: req.params.id,
      panchayat: req.user.panchayatId,
    });

    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    employee.status = "active";
    await employee.save();

    res.json({ message: "Employee activated" });
  } catch (err) {
    res.status(500).json({ message: "Activation failed" });
  }
};
