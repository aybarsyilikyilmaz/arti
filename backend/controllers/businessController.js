const Business = require('../models/Business');
const tokenService = require('../services/tokenService');

exports.register = async (req, res, next) => {
  try {
    const {
      name, branchName, email, phone, password, address, coordinates, businessType,
      branchType, legalName, taxOffice, taxNumber, mersisNumber,
      mapsUrl,
      contactName, contactRole, contactPhone,
      dailyBoxCount, boxContents, pickupStart, pickupEnd
    } = req.body;

    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({ status: 'fail', message: 'Bu e-posta ile zaten bir hesap var.' });
    }

    const newBusiness = await Business.create({
      name,
      branchName,
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
      mapsUrl,
      contactName,
      contactRole,
      contactPhone,
      dailyBoxCount,
      boxContents,
      pickupStart,
      pickupEnd,
      kvkkConsentAt: new Date()
    });

    const accessToken = await tokenService.issueSession(res, newBusiness, 'business');

    res.status(201).json({
      status: 'success',
      accessToken,
      message: 'Kaydınız alındı! Hesabınız ekibimizce doğrulandıktan sonra kutu yayınlayabileceksiniz.',
      data: { business: newBusiness.toSafeJSON() }
    });
  } catch (err) {
    // İç detay sızdırma: yalnızca bilinen hata tipleri kullanıcıya yansıtılır
    if (err.code === 11000) {
      return res.status(400).json({ status: 'fail', message: 'Bu e-posta ile zaten bir hesap var.' });
    }
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ status: 'fail', message: first?.message || 'Geçersiz kayıt verisi.' });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let business = await Business.findOne({ email }).select('+password');

    if (business) {
      if (!(await business.correctPassword(password, business.password))) {
        return res.status(401).json({ status: 'fail', message: 'Hatalı e-posta veya şifre.' });
      }
      const accessToken = await tokenService.issueSession(res, business, 'business');
      return res.status(200).json({
        status: 'success',
        accessToken,
        data: { business: { id: business._id, name: business.name, status: business.status } }
      });
    }

    const Employee = require('../models/Employee');
    const employee = await Employee.findOne({ email }).select('+password').populate('business');
    if (employee) {
      if (!(await employee.correctPassword(password, employee.password))) {
        return res.status(401).json({ status: 'fail', message: 'Hatalı e-posta veya şifre.' });
      }
      if (!employee.business) {
        return res.status(401).json({ status: 'fail', message: 'Bağlı olduğunuz işletme bulunamadı.' });
      }
      const accessToken = await tokenService.issueSession(res, employee, 'employee', { businessId: String(employee.business._id) });
      return res.status(200).json({
        status: 'success',
        accessToken,
        data: { 
          business: { id: employee.business._id, name: employee.business.name, status: employee.business.status },
          employee: { id: employee._id, name: employee.name, allowedPages: employee.allowedPages, allowedBranches: employee.allowedBranches || [] }
        }
      });
    }

    return res.status(401).json({ status: 'fail', message: 'Hatalı e-posta veya şifre.' });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    let session = await tokenService.rotateSession(req, res, Business, 'business');
    if (session) {
      return res.status(200).json({ status: 'success', accessToken: session.accessToken });
    }

    const Employee = require('../models/Employee');
    session = await tokenService.rotateSession(req, res, Employee, 'employee');
    if (session) {
      return res.status(200).json({ status: 'success', accessToken: session.accessToken });
    }

    return res.status(401).json({ status: 'fail', message: 'Oturum geçersiz. Lütfen tekrar giriş yapın.' });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await tokenService.revokeSession(req, res, Business, 'business');
    const Employee = require('../models/Employee');
    await tokenService.revokeSession(req, res, Employee, 'employee');
    res.status(200).json({ status: 'success', message: 'Çıkış yapıldı.' });
  } catch (err) {
    next(err);
  }
};

// --- İşletme paneli (Faz 4 frontend) ---

exports.getMe = async (req, res, next) => {
  try {
    const Business = require('../models/Business');
    const business = await Business.findById(req.auth.id);
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });

    let employeeData = null;
    if (req.auth.employeeId) {
      const Employee = require('../models/Employee');
      const employee = await Employee.findById(req.auth.employeeId);
      if (employee) {
        employeeData = employee.toSafeJSON();
        employeeData.allowedBranches = employee.allowedBranches || [];
      }
    }

    res.status(200).json({ 
      status: 'success', 
      data: { 
        business: business.toSafeJSON(),
        employee: employeeData
      } 
    });
  } catch (err) {
    next(err);
  }
};

// Yalnızca panelden yönetilebilir alanlar güncellenir (e-posta/VKN/status ASLA)
exports.updateProfile = async (req, res, next) => {
  try {
    const Business = require('../models/Business');
    const ALLOWED = [
      'defaultPackageCount', 'defaultPrice', 'defaultOriginalPrice',
      'pickupStart', 'pickupEnd', 'whatsappPhone', 'contactPhone', 'boxContents', 'description',
    ];
    const update = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const business = await Business.findByIdAndUpdate(req.auth.id, update, {
      new: true,
      runValidators: true,
    });
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });
    res.status(200).json({ status: 'success', message: 'Ayarlar kaydedildi.', data: { business: business.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

exports.updateProfileRequest = async (req, res, next) => {
  try {
    const Business = require('../models/Business');
    const business = await Business.findById(req.auth.id);
    if (!business) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });

    if (business.pendingUpdates) {
      return res.status(400).json({ status: 'fail', message: 'Zaten onay bekleyen bir profil güncelleme talebiniz var.' });
    }

    const ALLOWED = [
      'name', 'branchName', 'businessType', 'branchType', 'legalName', 'taxOffice', 'taxNumber',
      'mapsUrl', 'address', 'contactName', 'contactRole', 'email', 'phone'
    ];
    const updateReq = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined && req.body[key] !== business[key]) {
        updateReq[key] = req.body[key];
      }
    }

    if (Object.keys(updateReq).length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Değiştirilen bir bilgi bulunamadı.' });
    }

    business.pendingUpdates = updateReq;
    await business.save();

    res.status(200).json({ status: 'success', message: 'Profil güncelleme talebiniz yönetici onayına iletildi.', data: { business: business.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

// --- Zincir Şube (Branch) Yönetimi ---

exports.createBranch = async (req, res, next) => {
  try {
    const parent = await Business.findById(req.auth.id);
    if (!parent) return res.status(404).json({ status: 'fail', message: 'Ana hesap bulunamadı.' });
    if (parent.branchType !== 'zincir' && !parent.parentBusinessId) {
      // Eğer tekil işletmeyse zincir yapmak istiyorsa güncelleyebiliriz
      parent.branchType = 'zincir';
      await parent.save();
    }

    const { branchName, mapsUrl, address, phone } = req.body;
    
    // Rastgele benzersiz bir e-posta üret (sadece şubeler için login zorunlu olmadığından)
    const uniqueEmail = `branch_${Date.now()}_${Math.random().toString(36).substring(7)}@arti.dev`;
    const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';

    const branch = await Business.create({
      name: parent.name, // Marka adı hep aynı kalır
      branchName, // Şube adı (Moda, Kadıköy vb.)
      mapsUrl,
      address,
      phone,
      email: uniqueEmail,
      password: randomPassword,
      parentBusinessId: parent.parentBusinessId || parent._id, // Eğer şubeden yeni şube ekleniyorsa asıl merkeze bağla
      branchType: 'tek', // Şube de alt şube açmasın
      businessType: parent.businessType,
      legalName: parent.legalName,
      taxOffice: parent.taxOffice,
      taxNumber: parent.taxNumber,
      mersisNumber: parent.mersisNumber,
      status: 'APPROVED', // Ana hesap onaylıysa şube de onaylı başlasın
      kvkkConsentAt: new Date()
    });

    res.status(201).json({ status: 'success', message: 'Şube başarıyla oluşturuldu.', data: { branch: branch.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

exports.getBranches = async (req, res, next) => {
  try {
    const current = await Business.findById(req.auth.id);
    if (!current) return res.status(404).json({ status: 'fail', message: 'İşletme bulunamadı.' });

    let parentId = current.parentBusinessId || current._id;
    
    // Ana hesap ve ana hesaba bağlı tüm şubeleri getir
    const [parent, branches] = await Promise.all([
      Business.findById(parentId).select('name branchName _id parentBusinessId address'),
      Business.find({ parentBusinessId: parentId }).select('name branchName _id parentBusinessId address')
    ]);

    let allAccounts = [parent, ...branches].filter(b => b); // null kontrolü

    if (req.auth.role === 'employee' || req.auth.employeeId) {
      const Employee = require('../models/Employee');
      const employee = await Employee.findById(req.auth.employeeId || req.auth.id);
      if (employee) {
        const allowedIds = employee.allowedBranches ? employee.allowedBranches.map(id => id.toString()) : [];
        const businessId = employee.business ? employee.business.toString() : null;
        if (businessId && !allowedIds.includes(businessId)) allowedIds.push(businessId);
        
        allAccounts = allAccounts.filter(acc => allowedIds.includes(acc._id.toString()));
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        currentId: current._id,
        parentId: parentId,
        accounts: allAccounts
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.switchBranch = async (req, res, next) => {
  try {
    const { targetId } = req.body;
    if (!targetId) return res.status(400).json({ status: 'fail', message: 'Hedef ID belirtilmedi.' });

    const target = await Business.findById(targetId);
    let current;
    if (req.auth.role !== 'employee' && !req.auth.employeeId) {
      current = await Business.findById(req.auth.id);
      if (!current) return res.status(404).json({ status: 'fail', message: 'Mevcut hesap bulunamadı.' });
    }

    if (!target) return res.status(404).json({ status: 'fail', message: 'Hedef hesap bulunamadı.' });

    if (req.auth.role === 'employee' || req.auth.employeeId) {
      // Çalışanlar için kendi izinli şubeleri arasında mı geçiş yapıyor kontrolü
      const Employee = require('../models/Employee');
      const employee = await Employee.findById(req.auth.employeeId || req.auth.id);
      
      const allowedBranchIds = employee.allowedBranches ? employee.allowedBranches.map(id => id.toString()) : [employee.business.toString()];
      if (!allowedBranchIds.includes(targetId)) {
        return res.status(403).json({ status: 'fail', message: 'Bu şubeye geçiş yetkiniz yok.' });
      }
    } else {
      // Yetki kontrolü: Her ikisi de aynı parent'a bağlı mı veya biri diğerinin parent'ı mı? (İşletme patronu için)
      const currentParentId = current.parentBusinessId ? current.parentBusinessId.toString() : current._id.toString();
      const targetParentId = target.parentBusinessId ? target.parentBusinessId.toString() : target._id.toString();

      if (currentParentId !== targetParentId) {
        return res.status(403).json({ status: 'fail', message: 'Bu hesaba geçiş yetkiniz yok.' });
      }
    }

    // Yeni token oluştur ve cookie'ye yaz
    let accessToken;
    if (req.auth.role === 'employee' || req.auth.employeeId) {
      const Employee = require('../models/Employee');
      const employee = await Employee.findById(req.auth.employeeId || req.auth.id);
      accessToken = await tokenService.issueSession(res, employee, 'employee', { businessId: target._id.toString() });
    } else {
      accessToken = await tokenService.issueSession(res, target, 'business');
    }

    res.status(200).json({ status: 'success', accessToken, data: { business: target.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};
