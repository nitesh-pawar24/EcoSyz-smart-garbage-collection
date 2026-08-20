import mongoose from 'mongoose';
import WasteData from '../models/WasteData.model.js';
import Complaint from '../models/Complaint.model.js';
import Attendance from '../models/attendance.model.js';
import Employee from '../models/Employee.model.js';

export const generateReport = async (req, res) => {
    try {
        const { type, from, to, panchayatId, subType, ward, category, status, role, employeeId } = req.query;

        if (!from || !to) {
            return res.status(400).json({ message: "Date range (from, to) is required" });
        }

        const startDate = new Date(from);
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);

        let data = {};
        const filters = { ward, category, status, role, employeeId };

        switch (type) {
            case 'Waste Collection Summaries':
                data = await getWasteCollectionSummary(startDate, endDate, panchayatId, filters);
                break;
            case 'Complaint and Grievance Resolution Times':
            case 'Complaint & Grievance Resolution Times':
            case 'Complaint & Grievance Resolution':
                data = await getComplaintResolutionSummary(startDate, endDate, panchayatId, filters);
                break;
            case 'Segregation Compliance Percentage':
            case 'Segregation Compliance Metrics':
                data = await getSegregationCompliance(startDate, endDate, panchayatId, filters);
                break;
            case 'Employee Attendance Summaries':
                data = await getAttendanceSummary(startDate, endDate, panchayatId, filters);
                break;
            case 'Year-on-Year comparison charts':
            case 'Year-on-Year Growth Charts':
                data = await getYearOnYearComparison(startDate, endDate, panchayatId, subType, filters);
                break;
            case 'Monthly Expense Reports':
                data = getExpenseReportMock(startDate, endDate);
                break;
            default:
                return res.status(400).json({ message: "Invalid report type" });
        }

        res.status(200).json({
            success: true,
            reportType: type,
            period: { from, to },
            data
        });

    } catch (error) {
        console.error("Report Generation Error:", error);
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    }
};

// Helper Functions

const getWasteCollectionSummary = async (start, end, panchayatId, filters) => {
    const matchQuery = {
        date: { $gte: start, $lte: end }
    };

    if (filters.ward) matchQuery.ward = filters.ward;
    if (panchayatId) matchQuery.panchayat = panchayatId;

    const summary = await WasteData.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: "$ward",
                totalOrganic: { $sum: "$organic" },
                totalRecyclable: { $sum: "$recyclable" },
                totalGeneral: { $sum: "$general" },
                totalWaste: { $sum: "$total" },
                collectionCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return summary;
};

const getComplaintResolutionSummary = async (start, end, panchayatId, filters) => {
    const matchQuery = {
        createdAt: { $gte: start, $lte: end }
    };
    if (panchayatId) matchQuery.panchayat = panchayatId;
    if (filters.ward) matchQuery.ward = filters.ward;
    if (filters.category) matchQuery.category = filters.category;
    if (filters.status) matchQuery.status = filters.status;

    const summary = await Complaint.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const resolutionStats = await Complaint.aggregate([
        {
            $match: {
                ...matchQuery,
                status: "Resolved",
                resolvedAt: { $exists: true }
            }
        },
        {
            $project: {
                resolutionDuration: { $subtract: ["$resolvedAt", "$createdAt"] }
            }
        },
        {
            $group: {
                _id: null,
                avgResolutionTimeMs: { $avg: "$resolutionDuration" }
            }
        }
    ]);

    return {
        statusBreakdown: summary,
        avgResolutionTimeHours: resolutionStats.length > 0 ? (resolutionStats[0].avgResolutionTimeMs / (1000 * 60 * 60)).toFixed(2) : 0
    };
};

const getSegregationCompliance = async (start, end, panchayatId, filters) => {
    const matchQuery = { date: { $gte: start, $lte: end } };
    if (filters.ward) matchQuery.ward = filters.ward;
    if (panchayatId) matchQuery.panchayat = panchayatId;

    const stats = await WasteData.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: "$ward",
                totalWhoSegregated: {
                    $sum: { $cond: [{ $gt: ["$organic", 0] }, 1, 0] }
                },
                totalCollections: { $sum: 1 }
            }
        },
        {
            $project: {
                ward: "$_id",
                compliancePercentage: {
                    $multiply: [{ $divide: ["$totalWhoSegregated", { $max: ["$totalCollections", 1] }] }, 100]
                }
            }
        },
        { $sort: { compliancePercentage: -1 } }
    ]);
    return stats;
};

const getAttendanceSummary = async (start, end, panchayatId, filters) => {
    const matchQuery = {
        date: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] }
    };
    if (panchayatId) matchQuery.panchayat = panchayatId;
    if (filters.employeeId) matchQuery.labour = new mongoose.Types.ObjectId(filters.employeeId);

    const pipeline = [
        { $match: matchQuery },
        // Lookup employee details
        {
            $lookup: {
                from: 'employees',
                localField: 'labour',
                foreignField: '_id',
                as: 'employeeInfo'
            }
        },
        { $unwind: { path: '$employeeInfo', preserveNullAndEmptyArrays: false } },
    ];

    // Ward filter — filter by employee's ward array
    if (filters.ward) {
        pipeline.push({ $match: { 'employeeInfo.wards': filters.ward } });
    }
    // Role filter
    if (filters.role) {
        pipeline.push({ $match: { 'employeeInfo.role': filters.role } });
    }

    pipeline.push(
        // Group by employee
        {
            $group: {
                _id: '$labour',
                employeeCode: { $first: '$employeeInfo.employeeCode' },
                name: { $first: '$employeeInfo.name' },
                role: { $first: '$employeeInfo.role' },
                wards: { $first: '$employeeInfo.wards' },
                presentDays: { $sum: { $cond: ['$present', 1, 0] } },
                absentDays: { $sum: { $cond: ['$present', 0, 1] } },
                totalDays: { $sum: 1 }
            }
        },
        // Compute attendance percentage
        {
            $project: {
                _id: 0,
                employeeId: '$_id',
                employeeCode: 1,
                name: 1,
                role: 1,
                wards: 1,
                presentDays: 1,
                absentDays: 1,
                totalDays: 1,
                attendancePercentage: {
                    $round: [
                        { $multiply: [{ $divide: ['$presentDays', { $max: ['$totalDays', 1] }] }, 100] },
                        1
                    ]
                }
            }
        },
        { $sort: { name: 1 } }
    );

    const rows = await Attendance.aggregate(pipeline);
    return rows;
};

const getYearOnYearComparison = async (start, end, panchayatId, subType = 'waste', filters) => {
    let stats = [];
    const baseMatch = { date: { $gte: start, $lte: end } };
    if (panchayatId) baseMatch.panchayat = panchayatId;
    if (filters.ward) baseMatch.ward = filters.ward;

    if (subType === 'complaint') {
        const complaintMatch = { createdAt: { $gte: start, $lte: end } };
        if (panchayatId) complaintMatch.panchayat = panchayatId;
        if (filters.ward) complaintMatch.ward = filters.ward;

        stats = await Complaint.aggregate([
            { $match: complaintMatch },
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    totalComplaints: { $sum: 1 },
                    resolvedCount: {
                        $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
                    }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    year: "$_id",
                    totalComplaints: 1,
                    resolvedCount: 1,
                    resolutionRate: {
                        $multiply: [{ $divide: ["$resolvedCount", { $max: ["$totalComplaints", 1] }] }, 100]
                    }
                }
            }
        ]);
    }
    else if (subType === 'attendance') {
        const attendMatch = { markedAt: { $gte: start, $lte: end }, present: true };
        if (panchayatId) attendMatch.panchayat = panchayatId;
        if (filters.employeeId) attendMatch.labour = filters.employeeId;

        stats = await Attendance.aggregate([
            { $match: attendMatch },
            {
                $group: {
                    _id: { $year: "$markedAt" },
                    totalPresent: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    year: "$_id",
                    totalPresent: 1
                }
            }
        ]);
    }
    else if (subType === 'compliance') {
        stats = await WasteData.aggregate([
            { $match: baseMatch },
            {
                $group: {
                    _id: { $year: "$date" },
                    totalSegregated: {
                        $sum: { $cond: [{ $gt: ["$organic", 0] }, 1, 0] }
                    },
                    totalCollections: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    year: "$_id",
                    avgCompliance: {
                        $multiply: [{ $divide: ["$totalSegregated", { $max: ["$totalCollections", 1] }] }, 100]
                    }
                }
            }
        ]);
    }
    else {
        stats = await WasteData.aggregate([
            { $match: baseMatch },
            {
                $group: {
                    _id: { $year: "$date" },
                    totalWaste: { $sum: "$total" },
                    avgDailyWaste: { $avg: "$total" }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    year: "$_id",
                    totalWaste: 1,
                    avgDailyWaste: { $round: ["$avgDailyWaste", 2] }
                }
            }
        ]);
    }

    return { subType, stats };
};

const getExpenseReportMock = (start, end) => {
    return {
        note: "Estimated expenses based on active resources.",
        items: [
            { category: "Fuel Costs", amount: 15000 },
            { category: "Vehicle Maintenance", amount: 5000 },
            { category: "Equipment/Bin Replacements", amount: 8000 },
            { category: "Salaries (Estimated)", amount: 120000 }
        ],
        total: 148000
    };
};
