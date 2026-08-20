import Employee from "../models/Employee.model.js";

/* ================= CREATE ================= */
export const createEmployee = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      role,
      wards,
      joiningDate,
    } = req.body;

    const normalizePath = (p) => p?.replace(/\\/g, "/");

    // Auto-generate Employee Code
    const lastEmployee = await Employee.findOne(
      { panchayat: req.user.panchayatId },
      { employeeCode: 1 }
    )
      .sort({ createdAt: -1 })
      .lean();

    let nextCode = "EMP001";
    if (lastEmployee && lastEmployee.employeeCode) {
      const match = lastEmployee.employeeCode.match(/^EMP(\d+)$/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        nextCode = `EMP${String(nextNum).padStart(3, "0")}`;
      }
    }

    const employee = await Employee.create({
      panchayat: req.user.panchayatId,
      name,
      employeeCode: nextCode,
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
      return res.status(400).json({ message: "Employee code already exists" });
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
