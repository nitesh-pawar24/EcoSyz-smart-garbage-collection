import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "about-us",
        "segregation-guide",
        "contact-info",
        "announcement",
        "gallery",
        "events",
        "news",
        "schedule",
        "legal",
        "leadership",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String, // HTML or Markdown content
      required: false,
    },
    media: [
      {
        url: { type: String },
        type: { type: String, enum: ["image", "video", "file"] },
        caption: { type: String },
      },
    ],
    // New field for structured sections (Mission, Problem, Solution)
    cards: [
      {
        title: { type: String },
        content: { type: String },
        icon: { type: String } // stored as string identifier or url if needed
      }
    ],

    // Stats section (e.g. "2,500+ Households Served")
    stats: [
      {
        value: { type: String },
        label: { type: String },
      }
    ],

    // Accordion items (Mission, Objectives, How It Works, Legal)
    accordionItems: [
      {
        id: { type: String },
        title: { type: String },
        content: { type: String },
        list: [{ type: String }],
      }
    ],

    // Guiding principles cards
    principles: [
      {
        emoji: { type: String },
        title: { type: String },
        desc: { type: String },
      }
    ],

    // CTA section
    ctaHeading: { type: String },
    ctaSubtext: { type: String },

    // Guide / Resource cards (used in segregation-guide page)
    guides: [
      {
        icon: { type: String },
        title: { type: String },
        description: { type: String },
        type: { type: String }, // 'PDF Guide' | 'Video Guide' | 'Article'
        color: { type: String },
        iconColor: { type: String },
        tag: { type: String },
        steps: [{ type: String }],
      }
    ],


    // Gallery photos (used in gallery page)
    photos: [
      {
        url: { type: String },
        caption: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      }
    ],

    // Events list (used in events & workshops page)
    events: [
      {
        emoji: { type: String },
        title: { type: String },
        description: { type: String },
        date: { type: String },
        time: { type: String },
        location: { type: String },
        participants: { type: String },
        status: { type: String, enum: ["upcoming", "past"], default: "upcoming" },
        color: { type: String },
      }
    ],

    // News articles (used in news & updates page)
    newsItems: [
      {
        category: { type: String },
        title: { type: String },
        summary: { type: String },
        date: { type: String },
        readTime: { type: String },
        badge: { type: String },
        image: { type: String },
      }
    ],

    // Ward schedule entries (used in view schedule page)
    scheduleEntries: [
      {
        ward: { type: String },
        days: [{ type: String }],
        time: { type: String },
        area: { type: String },
        vehicle: { type: String },
        color: { type: String },
        bg: { type: String },
      }
    ],

    // Legal documents (used in legal & transparency page)
    legalDocs: [
      {
        title: { type: String },
        fileType: { type: String, default: "PDF" },
        fileName: { type: String },
        url: { type: String },
        size: { type: String },
        updatedAt: { type: String },
      }
    ],

    // Leadership / committee members
    leadershipMembers: [
      {
        name: { type: String },
        designation: { type: String },
        contact: { type: String },
        email: { type: String },
        bio: { type: String },
        photoUrl: { type: String },
      }
    ],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Ensure one content type per panchayat
contentSchema.index({ panchayat: 1, type: 1 }, { unique: true });

export default mongoose.model("Content", contentSchema);
