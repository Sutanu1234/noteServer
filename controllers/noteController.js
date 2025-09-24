import Note from "../models/Note.js";
import Tenant from "../models/Tenant.js";

// Create a note
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = req.user;

    if (!user.tenant)
      return res.status(400).json({ message: "You must belong to a tenant" });

    const tenant = await Tenant.findById(user.tenant);

    if (!tenant)
      return res.status(404).json({ message: "Tenant not found" });

    if (tenant.plan === "free" && tenant.credits <= 0) {
      return res
        .status(403)
        .json({ message: "You have no credits left! Upgrade to Pro." });
    }

    const note = await Note.create({
      title,
      content,
      tenant: tenant._id,
      createdBy: user._id,
      date: new Date(),
    });

    // Decrement credits for free plan
    if (tenant.plan === "free") {
      tenant.credits -= 1;
      await tenant.save();
    }

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all notes for tenant
export const getNotes = async (req, res) => {
  try {
    const user = req.user;
    if (!user.tenant)
      return res.status(400).json({ message: "You must belong to a tenant" });

    const notes = await Note.find({ tenant: user.tenant });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single note
export const getNote = async (req, res) => {
  try {
    const user = req.user;
    const note = await Note.findOne({ _id: req.params.id, tenant: user.tenant });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update note
export const updateNote = async (req, res) => {
  try {
    const user = req.user;
    const note = await Note.findOne({ _id: req.params.id, tenant: user.tenant });
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete note
export const deleteNote = async (req, res) => {
  try {
    const user = req.user;
    const note = await Note.findOneAndDelete({ _id: req.params.id, tenant: user.tenant });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
