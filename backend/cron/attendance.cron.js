import cron from "node-cron";
import Employee from "../models/Employee.model.js";
import Attendance from "../models/attendance.model.js";

const generateDefaultAttendanceForToday = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    // Get all active employees
    const activeEmployees = await Employee.find({ status: "active" });
    
    let createdCount = 0;
    
    for (const emp of activeEmployees) {
      // Check if attendance already exists for today
      const existing = await Attendance.findOne({
        labour: emp._id,
        date: today,
        panchayat: emp.panchayat
      });
      
      if (!existing) {
        await Attendance.create({
          panchayat: emp.panchayat,
          labour: emp._id,
          date: today,
          present: false,
          onDuty: true,
          source: "SYSTEM",
          markedAt: new Date(),
        });
        createdCount++;
      }
    }
    
    if (createdCount > 0) {
      console.log(`[CRON] Successfully created ${createdCount} default absent records for today (${today}).`);
    } else {
      console.log(`[CRON] Default attendance records for today (${today}) are already up to date.`);
    }
  } catch (error) {
    console.error("[CRON] Error generating default attendance:", error);
  }
};

const initializeCronJobs = () => {
  console.log("Initializing cron jobs...");
  
  // Run on startup to ensure today's records exist
  generateDefaultAttendanceForToday();

  // Run every day at 00:01 AM
  cron.schedule("1 0 * * *", () => {
    console.log("Running daily attendance cron job...");
    generateDefaultAttendanceForToday();
  });
};

export default initializeCronJobs;
