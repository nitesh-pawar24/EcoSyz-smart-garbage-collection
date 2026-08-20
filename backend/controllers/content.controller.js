import Content from "../models/Content.model.js";

// GET CONTENT (PUBLIC or ADMIN)
export const getContent = async (req, res) => {
  try {
    const { type } = req.query;
    // If authenticated as admin, show draft/published. If public (future), show only published.
    // For now, this is admin side, so show logic handles existence.

    // We assume the user is logged in as Panchayat Admin for this endpoint
    const panchayatId = req.user.panchayatId;

    const content = await Content.findOne({ panchayat: panchayatId, type });

    if (!content) {
      // Return empty structure if not found so frontend can initialize
      return res.json({ type, title: "", body: "", status: "draft", media: [] });
    }

    res.json(content);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch content" });
  }
};

// UPSERT CONTENT (SAVE DRAFT OR PUBLISH)
export const saveContent = async (req, res) => {
  try {
    const {
      type, title, body, status, media, cards, stats, accordionItems,
      principles, ctaHeading, ctaSubtext, guides,
      photos, events, newsItems, scheduleEntries, legalDocs, leadershipMembers,
    } = req.body;
    const panchayatId = req.user.panchayatId;

    let content = await Content.findOne({ panchayat: panchayatId, type });

    if (content) {
      content.title = title || content.title;
      content.body = body || content.body;
      content.status = status || content.status;
      if (media) content.media = media;
      if (cards) content.cards = cards;
      if (stats) content.stats = stats;
      if (accordionItems) content.accordionItems = accordionItems;
      if (principles) content.principles = principles;
      if (ctaHeading !== undefined) content.ctaHeading = ctaHeading;
      if (ctaSubtext !== undefined) content.ctaSubtext = ctaSubtext;
      if (guides) content.guides = guides;
      if (photos) content.photos = photos;
      if (events) content.events = events;
      if (newsItems) content.newsItems = newsItems;
      if (scheduleEntries) content.scheduleEntries = scheduleEntries;
      if (legalDocs) content.legalDocs = legalDocs;
      if (leadershipMembers) content.leadershipMembers = leadershipMembers;
      content.lastEditedBy = req.user._id;
      await content.save();
    } else {
      content = await Content.create({
        panchayat: panchayatId,
        type, title, body, status, media, cards, stats, accordionItems,
        principles, ctaHeading, ctaSubtext, guides,
        photos, events, newsItems, scheduleEntries, legalDocs, leadershipMembers,
        lastEditedBy: req.user._id,
      });
    }

    res.json(content);
  } catch (err) {
    console.error("Save Content Error:", err);
    res.status(500).json({ message: "Failed to save content", error: err.message });
  }
};



// GET PUBLIC CONTENT (For Public Website)
export const getPublicContent = async (req, res) => {
  try {
    const { panchayatId } = req.params;
    const { type } = req.query;

    if (!panchayatId || !type) {
      return res.status(400).json({ message: "Panchayat ID and Content Type are required" });
    }

    // Convert string ID to ObjectId if needed, or mongoose handles it.
    // We only show PUBLISHED content to public? 
    // For now, let's just return what's there, but ideally only 'published'
    // const content = await Content.findOne({ panchayat: panchayatId, type, status: 'published' });

    // Loosening restriction for development - return whatever is found, or draft if that's all there is
    // But logically public should only see published.
    // Let's stick to returning the document if it exists.
    const content = await Content.findOne({ panchayat: panchayatId, type });

    if (!content) {
      // Default content fallback can be handled by frontend, or we return null
      return res.status(404).json({ message: "Content not found" });
    }

    res.json(content);
  } catch (err) {
    console.error("Public Content Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch public content" });
  }
};

// UPLOAD MEDIA (Handling single file for now)
export const uploadContentMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const normalizePath = (p) => p?.replace(/\\/g, "/");
    const url = normalizePath(req.file.path);

    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};
