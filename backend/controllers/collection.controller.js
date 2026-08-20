import Dustbin from "../models/Dustbin.model.js";
import Collection from "../models/Collection.model.js";
import { calculateDistanceMeters } from "../utils/distance.js";

export const scanDustbin = async (req, res) => {
  const { code, latitude, longitude } = req.body;

  if (!code || latitude == null || longitude == null) {
    return res.status(400).json({ message: "Missing scan data" });
  }

  // 1️⃣ Find dustbin
  const dustbin = await Dustbin.findOne({
    code,
    panchayatId: req.user.panchayatId,
    status: "active",
  });

  if (!dustbin) {
    return res.status(404).json({ message: "Invalid QR code",
      success: false,
     });
  }

  // 2️⃣ Calculate distance
  const distance = calculateDistanceMeters(
    latitude,
    longitude,
    dustbin.latitude,
    dustbin.longitude
  );
  

 let gpsValid = true;
let requireSelfie = false;

if (distance > 20) {
  gpsValid = false;
  requireSelfie = true;
}

if (Math.random() < 0.2) {
  requireSelfie = true;
}


  // 3️⃣ Attendance logic (first scan of day)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const existingScan = await Collection.findOne({
    labourId: req.user._id,
    createdAt: { $gte: todayStart },
  });

  const attendanceMarked = !existingScan;

  // 4️⃣ Save collection
  const collection = await Collection.create({
  panchayatId: req.user.panchayatId,
  dustbinId: dustbin._id,
  labourId: req.user._id,
  latitude,
  longitude,
  distance,
  attendanceMarked,
  gpsValid,
  selfieRequired: requireSelfie,
});


  res.json({
  message: "Scan recorded",
  attendanceMarked,
  distance,
  gpsValid,
  requireSelfie,
  collectionId: collection._id,
});

};

export const bulkSyncCollections = async (req, res) => {
  const { scans } = req.body;

  // iterate and call same scan logic
  // mark as offline=true

  res.status(200).json({ message: "Offline scans synced", count: scans.length,
    success: true,
   });
};
