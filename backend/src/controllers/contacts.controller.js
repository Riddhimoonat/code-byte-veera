import EmergencyContact from '../models/EmergencyContact.model.js';

// GET /api/contacts
const getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ user_id: req.user.id });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/contacts
const addContact = async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    if (!name || !phone || !relationship) {
      return res.status(400).json({ success: false, message: 'name, phone and relationship are required' });
    }

    const contact = await EmergencyContact.create({
      user_id: req.user.id,
      name,
      phone,
      relationship,
    });

    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/contacts/:id
const deleteContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id, // ensure ownership
    });

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { getContacts, addContact, deleteContact };
