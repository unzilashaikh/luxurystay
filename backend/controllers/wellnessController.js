const WellnessPackage = require('../models/WellnessPackage');
const AppError = require('../utils/customError');

const DEFAULT_PACKAGES = [
  {
    name: 'The Serenity Escape',
    duration: 'Half Day · 4 hrs',
    price: 280,
    badge: '',
    featured: false,
    color: '#8B7355',
    features: [
      'Thermal Pool Access',
      'Aromatherapy Massage (60 min)',
      'Herbal Elixir Welcome',
      'Tranquility Lounge Access'
    ],
    sortOrder: 1
  },
  {
    name: 'The Royal Retreat',
    duration: 'Full Day · 8 hrs',
    price: 520,
    badge: 'Most Popular',
    featured: true,
    color: '#C1A166',
    features: [
      'Full Thermal Journey',
      'Signature Facial (75 min)',
      'Deep Tissue Massage (90 min)',
      'Private Dining Experience',
      'Wellness Journal & Take-Home Kit'
    ],
    sortOrder: 2
  },
  {
    name: 'The Ultimate Renewal',
    duration: '2 Days · Overnight',
    price: 980,
    badge: 'Premium',
    featured: false,
    color: '#2C3E50',
    features: [
      'Everything in Royal Retreat',
      'Private Candlelit Suite Soak',
      'Personal Wellness Consultant',
      'Custom Nutrition Plan',
      'Chauffeured Arrival & Departure'
    ],
    sortOrder: 3
  }
];

const seedIfEmpty = async () => {
  const count = await WellnessPackage.countDocuments();
  if (count === 0) {
    await WellnessPackage.insertMany(DEFAULT_PACKAGES);
  }
};

exports.getAllPackages = async (req, res, next) => {
  try {
    await seedIfEmpty();
    const query = req.query.public === 'true' ? { active: true } : {};
    const packages = await WellnessPackage.find(query).sort({ sortOrder: 1, createdAt: 1 });

    res.status(200).json({
      status: 'success',
      results: packages.length,
      data: { packages }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPackage = async (req, res, next) => {
  try {
    const pkg = await WellnessPackage.findById(req.params.id);
    if (!pkg) return next(new AppError('Wellness package not found', 404));

    res.status(200).json({
      status: 'success',
      data: { package: pkg }
    });
  } catch (error) {
    next(error);
  }
};

exports.createPackage = async (req, res, next) => {
  try {
    const { name, duration, price, badge, featured, color, features, active, sortOrder } = req.body;

    const pkg = await WellnessPackage.create({
      name,
      duration,
      price: Number(price),
      badge: badge || '',
      featured: Boolean(featured),
      color: color || '#8B7355',
      features: Array.isArray(features) ? features.filter((f) => f && String(f).trim()) : [],
      active: active !== false,
      sortOrder: sortOrder ?? 0
    });

    res.status(201).json({
      status: 'success',
      data: { package: pkg }
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.price != null) updates.price = Number(updates.price);
    if (updates.features) {
      updates.features = updates.features.filter((f) => f && String(f).trim());
    }

    const pkg = await WellnessPackage.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!pkg) return next(new AppError('Wellness package not found', 404));

    res.status(200).json({
      status: 'success',
      data: { package: pkg }
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePackage = async (req, res, next) => {
  try {
    const pkg = await WellnessPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return next(new AppError('Wellness package not found', 404));

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
