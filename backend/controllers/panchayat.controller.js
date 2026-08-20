import Panchayat from '../models/Panchayat.model.js'

/**
 * CREATE PANCHAYAT (Company Admin)
 */
export const createPanchayat = async (req, res) => {
  try {


    const { name, address, inchargeName, phone, email, website, estHouseholds, estLabours } =
      req.body

    if (!name || !address || !inchargeName || !phone) {
      return res.status(400).json({
        message: 'All required fields must be provided',
      })
    }

    const panchayat = await Panchayat.create({
      name,
      address,
      inchargeName,
      contactPhone: phone,
      contactEmail: email,
      website,
      estHouseholds,
      estLabours,
      documents: {
        inchargeIdProof: req.files?.inchargeIdProof
          ? `panchayats/${req.files.inchargeIdProof[0].filename}`
          : null,

        registrationLetter: req.files?.registrationLetter
          ? `panchayats/${req.files.registrationLetter[0].filename}`
          : null,
      },
      status: 'pending',
    })


    return res.status(201).json({
      message: 'Panchayat submitted for approval',
      panchayat,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: 'Failed to create panchayat',
    })
  }
}

/**
 * LIST PANCHAYATS
 */
export const listPanchayats = async (req, res) => {
  const { status } = req.query
  const filter = status ? { status } : {}

  const panchayats = await Panchayat.find(filter).sort({ createdAt: -1 })
  res.status(200).json(panchayats)
}

/**
 * APPROVE PANCHAYAT
 */
export const approvePanchayat = async (req, res) => {
  const { id } = req.params

  const panchayat = await Panchayat.findById(id)
  if (!panchayat) {
    return res.status(404).json({ message: 'Panchayat not found' })
  }

  panchayat.status = 'active'
  await panchayat.save()

  res.json({ message: 'Panchayat approved' })
}

/**
 * REJECT PANCHAYAT
 */
export const rejectPanchayat = async (req, res) => {
  const { id } = req.params

  const panchayat = await Panchayat.findById(id)
  if (!panchayat) {
    return res.status(404).json({ message: 'Panchayat not found' })
  }

  panchayat.status = 'rejected'
  await panchayat.save()

  res.json({ message: 'Panchayat rejected' })
}

export const getPanchayatById = async (req, res) => {
  const { id } = req.params

  const panchayat = await Panchayat.findById(id)
  if (!panchayat) {
    return res.status(404).json({ message: 'Panchayat not found' })
  }

  res.status(200).json(panchayat)
}

/**
 * UPDATE PANCHAYAT SETTINGS (Admin/Company Admin)
 */
export const updatePanchayatSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { isScheduleEnabled } = req.body;

    const panchayat = await Panchayat.findByIdAndUpdate(
      id,
      { isScheduleEnabled },
      { new: true }
    );

    if (!panchayat) {
      return res.status(404).json({ message: 'Panchayat not found' });
    }

    res.json({ message: 'Settings updated successfully', panchayat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
}
