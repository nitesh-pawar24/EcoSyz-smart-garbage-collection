import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema(
  {
    panchayatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Panchayat',
      required: true,
      unique: true,
    },

    planName: {
      type: String,
      enum: ['BASIC', 'STANDARD', 'PREMIUM'],
      required: true,
    },
    status: {
  type: String,
  enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
  default: "ACTIVE",
},


    householdLimit: {
      type: Number,
      required: true,
    },

    labourLimit: {
      type: Number,
      required: true,
    },

    features: {
      type: [String],
      default: [],
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    graceEndDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Subscription ||
  mongoose.model('Subscription', SubscriptionSchema)
