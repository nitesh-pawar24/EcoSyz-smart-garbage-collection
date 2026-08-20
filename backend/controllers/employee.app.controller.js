import Query from "../models/Query.model.js";
import Feedback from "../models/Feedback.model.js";
import Employee from "../models/Employee.model.js";
import Attendance from "../models/attendance.model.js";

// @route  POST /api/employee/query
export const submitQuery = async (req, res) => {
  try {
    const { _id: labour, panchayatId: panchayat } = req.user;
    const { description } = req.body;
    if (!description?.trim())
      return res.status(400).json({ message: "Description is required." });

    const query = await Query.create({ panchayat, labour, description });
    res.status(201).json({ message: "Query submitted successfully.", query });
  } catch (err) {
    console.error("Submit Query Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @route  POST /api/employee/feedback
export const submitFeedback = async (req, res) => {
  try {
    const { _id: labour, panchayatId: panchayat } = req.user;
    const { message, rating } = req.body;
    if (!message?.trim())
      return res.status(400).json({ message: "Feedback message is required." });

    const fb = await Feedback.create({ panchayat, labour, message, rating });
    res.status(201).json({ message: "Feedback submitted successfully.", fb });
  } catch (err) {
    console.error("Submit Feedback Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @route  GET /api/employee/committee
// Returns Supervisors from same panchayat for the employee to call
export const getCommittee = async (req, res) => {
  try {
    const { panchayatId } = req.user;
    const supervisors = await Employee.find({
      panchayat: panchayatId,
      role: { $in: ["Supervisor", "Collector", "Driver"] },
      status: "active",
    })
      .select("name role phone ward")
      .lean();

    res.json(supervisors);
  } catch (err) {
    console.error("Get Committee Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @route  GET /api/employee/attendance-history
// Returns attendance records for the logged-in employee, grouped by month
export const getAttendanceHistory = async (req, res) => {
  try {
    const { _id: labour } = req.user;
    const { month, year } = req.query;

    const now = new Date();
    const y = parseInt(year) || now.getFullYear();
    const m = parseInt(month) || now.getMonth() + 1;

    // Build date range YYYY-MM-DD for the month
    const pad = (n) => String(n).padStart(2, "0");
    const start = `${y}-${pad(m)}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${y}-${pad(m)}-${pad(lastDay)}`;

    const records = await Attendance.find({
      labour,
      date: { $gte: start, $lte: end },
    })
      .select("date present onDuty source")
      .lean();

    // Build a map date -> status for the frontend calendar
    const history = {};
    records.forEach((r) => {
      history[r.date] = r.present ? "P" : "A";
    });

    res.json({
      year: y,
      month: m,
      history,
      totalPresent: records.filter((r) => r.present).length,
      totalAbsent: records.filter((r) => !r.present).length,
    });
  } catch (err) {
    console.error("Attendance History Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
