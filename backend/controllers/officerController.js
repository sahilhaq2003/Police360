const Officer = require('../models/Officer');
const bcrypt = require('bcrypt');

const dupKey = (err) => err && err.code === 11000;
const castId = (err) => err && err.name === 'CastError' && err.path === '_id';

// CREATE
exports.createOfficer = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const saved = await new Officer({ ...rest, password: hashedPassword }).save();
    const { password: _pw, ...safe } = saved.toObject();
    res.status(201).json(safe);
  } catch (err) {
    if (dupKey(err)) {
      return res.status(409).json({
        message: 'Duplicate value for a unique field',
        fields: Object.keys(err.keyPattern || {}),
      });
    }
    res.status(400).json({ message: err.message });
  }
};

// LIST (server-driven: search/filter/sort/paginate + KPIs + stations)
exports.getAllOfficers = async (req, res) => {
  try {
    const {
      q = '',
      role = 'All',
      status = 'All',          // All | Active | Inactive | Deactivated
      station = 'All',
      hideAdmins = 'true',     // 'true' | 'false'
      sort = 'createdAt:desc', // name|officerId|email|station|role|createdAt : asc|desc
      page = 1,
      pageSize = 10,
      lite = 'false',          // if 'true', skip KPIs and stations aggregation for speed
    } = req.query;

    // ---- Build filter ----
    const filter = {};
    const query = String(q || '').trim();
    if (query) {
      const regex = new RegExp(query, 'i');
      filter.$or = [
        { name: regex },
        { officerId: regex },
        { email: regex },
        { username: regex },
        { contactNumber: regex },
        { station: regex },
        { role: regex },
      ];
    }
    if (role !== 'All') {
      filter.role = role;
    } else if (hideAdmins === 'true') {
      filter.role = { $ne: 'Admin' };
    }
    if (station !== 'All') filter.station = station;

    const sNorm = String(status || '').toLowerCase();
    if (sNorm === 'active') filter.isActive = true;
    else if (sNorm === 'inactive' || sNorm === 'deactivated') filter.isActive = false;

    // ---- Sort (whitelist) ----
    const [keyRaw, dirRaw] = String(sort).split(':');
    const allowed = new Set(['name', 'officerId', 'email', 'station', 'role', 'createdAt']);
    const sortKey = allowed.has(keyRaw) ? keyRaw : 'createdAt';
    const sortDir = dirRaw === 'asc' ? 1 : -1;
    const sortObj = { [sortKey]: sortDir };

    // ---- Pagination ----
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
    const skip = (p - 1) * ps;

    // Select minimal fields in lite mode
    const baseSelect = lite === 'true' ? 'name officerId email role isActive station createdAt' : '-password';

    if (lite === 'true') {
      const [rows, total] = await Promise.all([
        Officer.find(filter).select(baseSelect).sort(sortObj).skip(skip).limit(ps).lean(),
        Officer.countDocuments(filter),
      ]);
      return res.json({
        data: rows,
        page: p,
        pageSize: ps,
        total,
        totalPages: Math.max(1, Math.ceil(total / ps)),
      });
    }

    // ---- Full mode: include stations and KPIs ----
    const [rows, total, stationsAll, kpiAgg] = await Promise.all([
      Officer.find(filter).select(baseSelect).sort(sortObj).skip(skip).limit(ps).lean(),
      Officer.countDocuments(filter),
      Officer.distinct('station'),
      Officer.aggregate([
        {
          $group: {
            _id: null,
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            officer: { $sum: { $cond: [{ $eq: ['$role', 'Officer'] }, 1, 0] } },
            it: { $sum: { $cond: [{ $eq: ['$role', 'IT Officer'] }, 1, 0] } },
            admin: { $sum: { $cond: [{ $eq: ['$role', 'Admin'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const stations = ['All', ...stationsAll.filter(Boolean).sort()];
    const k = kpiAgg[0] || { active: 0, officer: 0, it: 0, admin: 0 };

    res.json({
      data: rows,
      page: p,
      pageSize: ps,
      total,
      totalPages: Math.max(1, Math.ceil(total / ps)),
      stations,
      kpis: { activeCount: k.active, officer: k.officer, it: k.it, admin: k.admin },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
exports.getOfficerById = async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id).select('-password').lean();
    if (!officer) return res.status(404).json({ message: 'Officer not found' });
    res.status(200).json(officer);
  } catch (err) {
    if (castId(err)) return res.status(400).json({ message: 'Invalid officer ID' });
    res.status(500).json({ message: err.message });
  }
};

// UPDATE (no password here)
exports.updateOfficer = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const updated = await Officer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password').lean();

    if (!updated) return res.status(404).json({ message: 'Officer not found' });
    res.json(updated);
  } catch (err) {
    if (dupKey(err)) {
      return res.status(409).json({
        message: 'Duplicate value for a unique field',
        fields: Object.keys(err.keyPattern || {}),
      });
    }
    if (castId(err)) return res.status(400).json({ message: 'Invalid officer ID' });
    res.status(400).json({ message: err.message });
  }
};

// SOFT DELETE (Deactivate)
exports.softDeleteOfficer = async (req, res) => {
  try {
    const result = await Officer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).lean();

    if (!result) return res.status(404).json({ message: 'Officer not found' });
    res.json({ message: 'Officer deactivated' });
  } catch (err) {
    if (castId(err)) return res.status(400).json({ message: 'Invalid officer ID' });
    res.status(500).json({ message: err.message });
  }
};

// HARD DELETE
exports.hardDeleteOfficer = async (req, res) => {
  try {
    const result = await Officer.findByIdAndDelete(req.params.id).lean();
    if (!result) return res.status(404).json({ message: 'Officer not found' });
    res.json({ message: 'Officer deleted' });
  } catch (err) {
    if (castId(err)) return res.status(400).json({ message: 'Invalid officer ID' });
    res.status(500).json({ message: err.message });
  }
};

// SEARCH (optional: shares same filters; small capped list)
exports.searchOfficers = async (req, res) => {
  try {
    const {
      query = '',
      role = 'All',
      status = 'All',
      station = 'All',
      hideAdmins = 'true',
      limit = 20,
    } = req.query;

    if (!String(query).trim()) return res.status(400).json({ message: 'Search query is required' });

    const regex = new RegExp(String(query).trim(), 'i');
    const filter = {
      $or: [
        { name: regex },
        { officerId: regex },
        { email: regex },
        { contactNumber: regex },
        { role: regex },
        { station: regex },
        { username: regex },
      ],
    };
    if (role !== 'All') {
      filter.role = role;
    } else if (hideAdmins === 'true') {
      filter.role = { $ne: 'Admin' };
    }
    if (station !== 'All') filter.station = station;

    const sNorm = String(status || '').toLowerCase();
    if (sNorm === 'active') filter.isActive = true;
    else if (sNorm === 'inactive' || sNorm === 'deactivated') filter.isActive = false;

    const rows = await Officer.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Math.min(100, Math.max(1, parseInt(limit, 10) || 20)))
      .lean();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
