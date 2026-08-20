import mongoose from 'mongoose'

const wasteDataSchema = new mongoose.Schema({
  panchayat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Panchayat',
    required: true,
    index: true
  },
  entryId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  collectionType: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly'],
    default: 'Daily'
  },
  ward: {
    type: String,
    required: true
  },
  organic: {
    type: Number,
    default: 0
  },
  recyclable: {
    type: Number,
    default: 0
  },
  general: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
}, { timestamps: true })
wasteDataSchema.index({ panchayat: 1, entryId: 1 }, { unique: true })

const WasteData = mongoose.model('WasteData', wasteDataSchema)

export default WasteData
