const Feedback = require('../models/Feedback');
const ServiceRequest = require('../models/ServiceRequest');
const WellnessPackage = require('../models/WellnessPackage');
const Reservation = require('../models/Reservation');
const { addChargeToReservation } = require('../utils/invoiceCharges');
const { notifyEvent } = require('../utils/notify');
const AppError = require('../utils/customError');
const APIFeatures = require('../utils/apiFeatures');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── FEEDBACK ENDPOINTS ──
exports.getAllFeedback = async (req, res, next) => {
  try {
    const features = new APIFeatures(Feedback.find(), req.query)
      .filter()
      .search(['guestName', 'comment', 'category'])
      .sort()
      .paginate();

    const feedbacks = await features.query;
    const total = await Feedback.countDocuments();

    res.status(200).json({
      status: 'success',
      results: feedbacks.length,
      total,
      data: {
        feedbacks
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createFeedback = async (req, res, next) => {
  try {
    const newFeedback = await Feedback.create(req.body);

    await notifyEvent({
      title: 'New guest feedback',
      message: `${newFeedback.guestName}: ${(newFeedback.comment || '').slice(0, 80)}`,
      type: 'Alert',
      alsoNotify: ['Receptionist'],
    });

    res.status(201).json({
      status: 'success',
      data: {
        feedback: newFeedback
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateFeedbackStatus = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return next(new AppError('No feedback found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        feedback
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return next(new AppError('No feedback found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// ── SERVICE REQUESTS ENDPOINTS ──
exports.getAllServiceRequests = async (req, res, next) => {
  try {
    const features = new APIFeatures(ServiceRequest.find(), req.query)
      .filter()
      .search(['guestName', 'roomNumber', 'serviceType', 'status'])
      .sort()
      .paginate();

    const requests = await features.query;
    const total = await ServiceRequest.countDocuments();

    res.status(200).json({
      status: 'success',
      results: requests.length,
      total,
      data: {
        requests
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyServiceRequests = async (req, res, next) => {
  try {
    if (req.user.role !== 'Guest') {
      return next(new AppError('This route is for guest accounts only.', 403));
    }

    const user = req.user;
    const name = user.name?.trim();
    const email = user.email?.trim().toLowerCase();

    const orConditions = [{ guest: user._id }];
    if (email) {
      orConditions.push({ guestEmail: email });
      orConditions.push({
        guestEmail: { $regex: new RegExp(`^${escapeRegex(email)}$`, 'i') },
      });
    }
    if (name) {
      orConditions.push({
        guestName: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
      });
    }

    if (orConditions.length === 0) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: { requests: [] },
      });
    }

    const filter = { $or: orConditions };
    if (req.query.roomNumber) {
      filter.roomNumber = String(req.query.roomNumber).trim();
    }

    let requests = await ServiceRequest.find(filter).sort({ createdAt: -1 });

    if (email) {
      await Promise.all(
        requests
          .filter((r) => !r.guest || !r.guestEmail)
          .map((r) =>
            ServiceRequest.updateOne(
              { _id: r._id },
              {
                $set: {
                  guest: user._id,
                  guestEmail: email,
                  guestName: r.guestName || name,
                },
              }
            )
          )
      );
      requests = await ServiceRequest.find(filter).sort({ createdAt: -1 });
    }

    res.status(200).json({
      status: 'success',
      results: requests.length,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

exports.createServiceRequest = async (req, res, next) => {
  try {
    let { guestName, roomNumber, serviceType, details, wellnessPackageId, reservationId, chargeAmount } =
      req.body;

    if (req.user.role === 'Guest') {
      guestName = req.user.name;
    }

    if (!guestName?.trim() || !roomNumber?.toString().trim() || !serviceType || !details?.trim()) {
      return next(new AppError('Room, service type, and details are required.', 400));
    }

    let amount = Number(chargeAmount) || 0;
    let packageId = wellnessPackageId || null;

    let spaPackageName = '';
    if (wellnessPackageId) {
      const pkg = await WellnessPackage.findById(wellnessPackageId);
      if (!pkg || !pkg.active) {
        return next(new AppError('Spa package not found or unavailable.', 404));
      }
      amount = pkg.price;
      packageId = pkg._id;
      spaPackageName = pkg.name;
    }

    const payload = {
      guestName: guestName.trim(),
      roomNumber: String(roomNumber).trim(),
      serviceType,
      details: details.trim(),
      chargeAmount: amount,
      wellnessPackage: packageId || undefined,
    };

    if (req.user.role === 'Guest') {
      payload.guest = req.user._id;
      payload.guestEmail = req.user.email?.trim().toLowerCase();

      let booking = null;
      if (reservationId) {
        booking = await Reservation.findById(reservationId);
      }
      if (!booking) {
        booking = await Reservation.findOne({
          $or: [{ guest: req.user._id }, { guestEmail: req.user.email?.toLowerCase() }],
          status: { $in: ['Checked In', 'Confirmed'] },
        }).sort({ checkIn: -1 });
      }
      if (booking) {
        payload.reservation = booking._id;
      }

      if (wellnessPackageId && amount > 0 && !payload.reservation) {
        return next(
          new AppError('No active booking found. Select or confirm a reservation before booking paid spa packages.', 400)
        );
      }
    }

    const newRequest = await ServiceRequest.create(payload);

    if (req.user.role === 'Guest' && amount > 0 && payload.reservation) {
      const billDescription =
        serviceType === 'Spa' && spaPackageName
          ? `Spa: ${spaPackageName}`
          : `${serviceType}: ${details.slice(0, 60)}`;

      const invoice = await addChargeToReservation(payload.reservation, {
        description: billDescription.length > 80 ? `${billDescription.slice(0, 77)}...` : billDescription,
        amount,
        source: wellnessPackageId ? 'wellness' : 'service',
        sourceId: packageId || newRequest._id,
      });

      if (invoice) {
        newRequest.billed = true;
        await newRequest.save();
      }
    }

    const billNote =
      newRequest.billed && amount > 0 ? ` — $${amount.toFixed(2)} added to bill` : '';
    await notifyEvent({
      title: 'Guest service request',
      message: `Room ${payload.roomNumber} — ${serviceType}: ${payload.details.slice(0, 60)}${billNote}`,
      type: 'Alert',
      alsoNotify: ['Receptionist'],
    });

    res.status(201).json({
      status: 'success',
      data: {
        request: newRequest,
        addedToBill: Boolean(newRequest.billed && amount > 0),
        chargeAmount: amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateServiceRequestStatus = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!request) {
      return next(new AppError('No service request found with that ID', 404));
    }

    await notifyEvent({
      title: 'Service request updated',
      message: `Room ${request.roomNumber} — ${request.serviceType} → ${request.status}`,
      type: 'Alert',
      alsoNotify: ['Receptionist'],
    });

    res.status(200).json({
      status: 'success',
      data: {
        request
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteServiceRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return next(new AppError('No service request found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
