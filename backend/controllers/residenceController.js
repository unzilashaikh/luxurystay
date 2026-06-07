const Residence = require('../models/Residence');
const Feedback = require('../models/Feedback');
const AppError = require('../utils/customError');
const { notifyAdmin, notifyEvent } = require('../utils/notify');

const DEFAULT_RESIDENCES = [
  {
    title: 'The Grand Penthouse',
    subtitle: 'City Center',
    image:
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
    features: ['4 Bedrooms', 'Private Elevator', 'Panoramic City Views', '24/7 Concierge'],
    priceFrom: 2500,
    sortOrder: 1,
  },
  {
    title: 'Oceanfront Villa',
    subtitle: 'Coastal Retreat',
    image:
      'https://images.unsplash.com/photo-1600607687931-cebf030cb021?auto=format&fit=crop&w=1200&q=80',
    features: [
      '5 Bedrooms',
      'Private Infinity Pool',
      'Direct Beach Access',
      'Personal Chef Staff',
    ],
    priceFrom: 4200,
    sortOrder: 2,
  },
];

const ensureDefaultResidences = async () => {
  const count = await Residence.countDocuments();
  if (count === 0) {
    await Residence.insertMany(DEFAULT_RESIDENCES);
  }
};

exports.getAllResidences = async (req, res, next) => {
  try {
    if (req.query.public === 'true') {
      await ensureDefaultResidences();
    }

    const query = req.query.public === 'true' ? { active: true } : {};
    const residences = await Residence.find(query).sort({ sortOrder: 1, createdAt: 1 });

    res.status(200).json({
      status: 'success',
      results: residences.length,
      data: { residences },
    });
  } catch (error) {
    next(error);
  }
};

exports.getResidence = async (req, res, next) => {
  try {
    const residence = await Residence.findById(req.params.id);
    if (!residence) {
      return next(new AppError('Residence not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { residence },
    });
  } catch (error) {
    next(error);
  }
};

const normalizeImageUrl = (url) => {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }
  return trimmed;
};

exports.createResidence = async (req, res, next) => {
  try {
    const image = normalizeImageUrl(req.body.image);
    if (req.body.image?.trim() && image === null) {
      return next(new AppError('Image must be a full URL starting with http:// or https://', 400));
    }
    const residence = await Residence.create({ ...req.body, image: image || '' });
    await notifyAdmin({
      title: 'Residence listing added',
      message: `${residence.title} — ${residence.subtitle || 'Luxury Stay'}`,
      type: 'Alert',
    });
    res.status(201).json({
      status: 'success',
      data: { residence },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateResidence = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.image !== undefined) {
      const image = normalizeImageUrl(updates.image);
      if (updates.image?.trim() && image === null) {
        return next(new AppError('Image must be a full URL starting with http:// or https://', 400));
      }
      updates.image = image || '';
    }
    const residence = await Residence.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!residence) {
      return next(new AppError('Residence not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { residence },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteResidence = async (req, res, next) => {
  try {
    const residence = await Residence.findByIdAndDelete(req.params.id);
    if (!residence) {
      return next(new AppError('Residence not found', 404));
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/** Public — residence inquiry → feedback + admin notification */
exports.createInquiry = async (req, res, next) => {
  try {
    const { residenceId, guestName, guestEmail, guestPhone, message } = req.body;

    if (!guestName?.trim() || !guestEmail?.trim() || !message?.trim()) {
      return next(new AppError('Name, email, and message are required.', 400));
    }

    let residenceTitle = 'General residence inquiry';
    if (residenceId) {
      const residence = await Residence.findById(residenceId);
      if (residence) residenceTitle = residence.title;
    }

    const comment = `[Residence: ${residenceTitle}]${guestPhone ? ` Phone: ${guestPhone.trim()}` : ''}\n\n${message.trim()}`;

    await Feedback.create({
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      rating: 5,
      comment,
      category: 'Overall',
    });

    await notifyEvent({
      title: 'Residence inquiry',
      message: `${guestName.trim()} — ${residenceTitle}: ${message.trim().slice(0, 60)}`,
      type: 'Alert',
      alsoNotify: ['Receptionist'],
    });

    res.status(201).json({
      status: 'success',
      message: 'Inquiry sent. Our team will contact you shortly.',
    });
  } catch (error) {
    next(error);
  }
};
