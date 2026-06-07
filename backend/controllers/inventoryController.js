const SupplyItem = require('../models/SupplyItem');
const AppError = require('../utils/customError');
const { notifyAdmin } = require('../utils/notify');

exports.getAllItems = async (req, res, next) => {
  try {
    const items = await SupplyItem.find().sort({ category: 1, name: 1 });
    res.status(200).json({
      status: 'success',
      results: items.length,
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const { name, category, quantity, unit, minLevel } = req.body;
    if (!name?.trim()) {
      return next(new AppError('Item name is required', 400));
    }

    const item = await SupplyItem.create({
      name: name.trim(),
      category: category || 'Cleaning',
      quantity: Number(quantity) >= 0 ? Number(quantity) : 0,
      unit: unit?.trim() || 'units',
      minLevel: Number(minLevel) >= 0 ? Number(minLevel) : 10,
    });

    await notifyAdmin({
      title: 'Inventory item added',
      message: `${item.name} (${item.category}) — qty ${item.quantity}`,
      type: 'Housekeeping',
    });

    res.status(201).json({
      status: 'success',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await SupplyItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return next(new AppError('Supply item not found', 404));
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

exports.requestRestock = async (req, res, next) => {
  try {
    const { quantityNeeded, note } = req.body;
    const item = await SupplyItem.findById(req.params.id);
    if (!item) {
      return next(new AppError('Supply item not found', 404));
    }

    item.restockRequested = true;
    item.restockNote = note
      ? `${note}${quantityNeeded ? ` (qty needed: ${quantityNeeded})` : ''}`
      : quantityNeeded
        ? `Restock requested — qty needed: ${quantityNeeded}`
        : 'Restock requested by housekeeping';
    item.requestedBy = req.user._id;
    item.requestedByName = req.user.name;
    await item.save();

    await notifyAdmin({
      title: 'Inventory restock requested',
      message: `${item.name}: ${item.restockNote} (by ${req.user.name || 'Housekeeping'})`,
      type: 'Housekeeping',
    });

    res.status(200).json({
      status: 'success',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const allowed = ['quantity', 'minLevel', 'name', 'category', 'unit'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const item = await SupplyItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return next(new AppError('Supply item not found', 404));
    }

    if (item.quantity <= item.minLevel) {
      await notifyAdmin({
        title: 'Low inventory stock',
        message: `${item.name}: ${item.quantity} ${item.unit || 'units'} left (min ${item.minLevel})`,
        type: 'Alert',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

exports.clearRestockRequest = async (req, res, next) => {
  try {
    const item = await SupplyItem.findByIdAndUpdate(
      req.params.id,
      {
        restockRequested: false,
        restockNote: '',
        requestedBy: undefined,
        requestedByName: '',
      },
      { new: true }
    );
    if (!item) {
      return next(new AppError('Supply item not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};
