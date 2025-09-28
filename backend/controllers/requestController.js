const Request = require('../models/Request');

// POST /requests - Officer creates a request
const createRequest = async (req, res) => {
  try {
    const { type, subject, description, appointmentDate, leaveStartDate, leaveEndDate } = req.body;
    if (!type || !subject || !description) {
      return res.status(400).json({ message: 'type, subject and description are required' });
    }

    const requestData = {
      officerId: req.user.id,
      type,
      subject,
      description,
    };

    // Add appointment date for appointment requests
    if (type === 'Request Appointment' && appointmentDate) {
      requestData.appointmentDate = appointmentDate;
    }

    // Add leave dates for leave requests
    if (type === 'Leave Request') {
      if (leaveStartDate) requestData.leaveStartDate = leaveStartDate;
      if (leaveEndDate) requestData.leaveEndDate = leaveEndDate;
    }

    const request = await Request.create(requestData);

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create request' });
  }
};

// GET /requests/my - Officer sees own requests
const getMyRequests = async (req, res) => {
  try {
    const list = await Request.find({ officerId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

// GET /requests - Admin sees all requests
const getAllRequests = async (_req, res) => {
  try {
    const list = await Request.find({}).populate('officerId', 'name officerId email').sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all requests' });
  }
};

// PUT /requests/:id - Admin updates status
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, appointmentDate } = req.body;
    if (!['Approved', 'Denied', 'Pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateBody = { status };
    if (appointmentDate) {
      const dateVal = new Date(appointmentDate);
      if (isNaN(dateVal.getTime())) return res.status(400).json({ message: 'Invalid appointmentDate' });
      updateBody.appointmentDate = dateVal;
    }

    const updated = await Request.findByIdAndUpdate(id, updateBody, { new: true })
      .populate('officerId', 'name officerId email');

    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update request status' });
  }
};

// POST /requests/:id/replies - Admin adds a reply
const addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: 'Reply message is required' });

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.replies.push({ admin: req.user.id, message: message.trim() });
    await request.save();

    const populated = await request.populate('officerId', 'name officerId email');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add reply' });
  }
};

// DELETE /requests/:id - Admin deletes a request
const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByIdAndDelete(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.status(200).json({ success: true, message: 'Request deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete request' });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  addReply,
  deleteRequest,
};


