import Household from "../models/Household.model.js";
import Dustbin from "../models/dustbin.model.js";
import Complaint from "../models/Complaint.model.js";
import Employee from "../models/Employee.model.js";
import Ward from "../models/Ward.model.js";
import Route from "../models/Route.model.js";
import WasteData from "../models/WasteData.model.js";

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    const panchayatId = req.user.panchayatId;

    if (!q || q.length < 2) {
      return res.json({ 
        households: [], 
        dustbins: [], 
        complaints: [],
        employees: [],
        wards: [],
        routes: [],
        wasteRecords: [] 
      });
    }

    const regex = new RegExp(q, "i");

    const [households, dustbins, complaints, employees, wards, routes, wasteRecords] = await Promise.all([
      Household.find({
        panchayat: panchayatId,
        $or: [
          { ownerName: regex },
          { houseNumber: regex },
          { address: regex },
          { mobile: regex },
        ],
      }).limit(5),
      Dustbin.find({
        panchayat: panchayatId,
        $or: [
          { binCode: regex },
          { locationText: regex },
        ],
      }).limit(5),
      Complaint.find({
        panchayat: panchayatId,
        $or: [
          { complaintId: regex },
          { reporterName: regex },
          { reporterMobile: regex },
          { type: regex },
        ],
      }).limit(5),
      Employee.find({
        panchayat: panchayatId,
        $or: [
          { name: regex },
          { employeeCode: regex },
          { role: regex },
          { phone: regex },
        ],
      }).limit(5),
      Ward.find({
        panchayat: panchayatId,
        name: regex,
      }).limit(5),
      Route.find({
        panchayat: panchayatId,
        $or: [
          { routeName: regex },
          { routeCode: regex },
          { assignedVehicle: regex },
        ],
      }).limit(5),
      WasteData.find({
        $or: [
          { entryId: regex },
          { ward: regex },
        ],
      }).limit(5),
    ]);

    res.json({
      households,
      dustbins,
      complaints,
      employees,
      wards,
      routes,
      wasteRecords,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
