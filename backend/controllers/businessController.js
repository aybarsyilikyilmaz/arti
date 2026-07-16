const Business = require('../models/Business');
const jwt = require('jsonwebtoken');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super-secret-arti-jwt-key-change-this', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

exports.register = async (req, res) => {
  try {
    const {
      name, email, phone, password, address, coordinates, businessType,
      branchType, legalName, taxOffice, taxNumber, mersisNumber,
      city, district, neighborhood,
      contactName, contactRole, contactPhone,
      dailyBoxCount, boxContents, pickupStart, pickupEnd
    } = req.body;

    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({ status: 'fail', message: 'Bu e-posta ile zaten bir hesap var.' });
    }

    const newBusiness = await Business.create({
      name,
      email,
      phone,
      password,
      address,
      location: coordinates ? { type: 'Point', coordinates } : undefined,
      businessType,
      branchType,
      legalName,
      taxOffice,
      taxNumber,
      mersisNumber,
      city,
      district,
      neighborhood,
      contactName,
      contactRole,
      contactPhone,
      dailyBoxCount,
      boxContents,
      pickupStart,
      pickupEnd
    });

    const token = signToken(newBusiness._id);
    newBusiness.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        business: newBusiness
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    const business = await Business.findOne({ email }).select('+password');

    if (!business || !(await business.correctPassword(password, business.password))) {
      return res.status(401).json({ status: 'fail', message: 'Hatalı e-posta veya şifre.' });
    }

    const token = signToken(business._id);

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
