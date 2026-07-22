const Business = require('../models/Business');
const tokenService = require('../services/tokenService');
const activityService = require('../services/activityService');
const { sha256 } = require('../utils/crypto');

// Aktivite logunda alanların Türkçe okunuşu
const FIELD_LABELS = {
  // Operasyonel (direkt kaydolur, loglanır)
  defaultPackageCount: 'günlük kutu adedi', defaultPrice: 'işletme hakedişi',
  defaultOriginalPrice: 'normal değer', pickupStart: 'teslim başlangıç',
  pickupEnd: 'teslim bitiş', boxContents: 'kutu içeriği', description: 'vitrin açıklaması',
  // Kimlik/yasal/adres (onaya gider, loglanır)
  name: 'işletme adı', branchName: 'şube adı', businessType: 'işletme türü', branchType: 'şube türü',
  legalName: 'yasal unvan', taxOffice: 'vergi dairesi', taxNumber: 'vergi no',
  mapsUrl: 'maps linki', address: 'adres', contactName: 'iletişim adı', contactRole: 'iletişim rolü',
  email: 'e-posta', phone: 'telefon', whatsappPhone: 'whatsapp', contactPhone: 'iletişim telefonu',
};

// Oturum/şifre uçları, kimliği doğrulanan gerçek principal üzerinde çalışmalı:
//   • Çalışan (employeeId var)  → kendi Employee dokümanı + rt_employee cookie
//   • İşletme sahibi            → Business dokümanı + rt_business cookie
// Aksi halde bir çalışan, patronun (Business) oturumlarını görüp iptal edebilirdi.
function resolvePrincipal(req) {
  if (req.auth && req.auth.employeeId) {
    return { Model: require('../models/Employee'), id: req.auth.employeeId, cookieName: 'rt_employee' };
  }
  return { Model: Business, id: req.auth.id, cookieName: 'rt_business' };
}

exports.register = async (req, res, next) => {
  try {
    const {
      name, branchName, email, phone, password, address, city, district, coordinates, businessType,
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
      city,
      district,
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

    const accessToken = await tokenService.issueSession(req, res, newBusiness, 'business');

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
      const accessToken = await tokenService.issueSession(req, res, business, 'business');
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
      const accessToken = await tokenService.issueSession(req, res, employee, 'employee', { businessId: String(employee.business._id) });
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
      'pickupStart', 'pickupEnd', 'boxContents', 'description',
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

    const changed = Object.keys(update).map((k) => FIELD_LABELS[k] || k);
    if (changed.length) {
      activityService.log({
        req, businessId: business._id, businessName: business.name, action: 'profile.update',
        message: `Ayarlar güncellendi: ${changed.join(', ')}`, meta: { changes: update },
      });
    }

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

    const ALLOWED = [
      'name', 'branchName', 'businessType', 'branchType', 'legalName', 'taxOffice', 'taxNumber',
      'mapsUrl', 'address', 'contactName', 'contactRole', 'email', 'phone', 'whatsappPhone', 'contactPhone'
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

    // Bekleyen bir talep (ör. IBAN) varsa üstüne EKLE, bloke etme — admin hepsini
    // tek onayda görür. Böylece IBAN onay beklerken profil değişikliği yapılabilir.
    business.pendingUpdates = { ...(business.pendingUpdates || {}), ...updateReq };
    await business.save();

    const changed = Object.keys(updateReq).map((k) => FIELD_LABELS[k] || k);
    activityService.log({
      req, businessId: business._id, businessName: business.name, action: 'profile.request',
      message: `Profil değişiklik talebi oluşturuldu (onaya gitti): ${changed.join(', ')}`,
      meta: { changes: updateReq },
    });

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
      accessToken = await tokenService.issueSession(req, res, employee, 'employee', { businessId: target._id.toString() });
    } else {
      accessToken = await tokenService.issueSession(req, res, target, 'business');
    }

    res.status(200).json({ status: 'success', accessToken, data: { business: target.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const { Model, id, cookieName } = resolvePrincipal(req);
    const doc = await Model.findById(id).select('+sessions');
    if (!doc) {
      return res.status(404).json({ status: 'fail', message: 'Hesap bulunamadı.' });
    }

    const rawToken = req.cookies?.[cookieName];
    const currentHashed = rawToken ? sha256(rawToken) : null;

    const sessions = (doc.sessions || []).map(s => ({
      deviceId: s.deviceId,
      deviceInfo: s.deviceInfo,
      ip: s.ip,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      isCurrent: currentHashed ? s.refreshTokenHash === currentHashed : false
    }));

    res.status(200).json({ status: 'success', sessions });
  } catch (err) {
    next(err);
  }
};

exports.revokeSessionByDeviceId = async (req, res, next) => {
  try {
    const { Model, id } = resolvePrincipal(req);
    const { deviceId } = req.params;

    const doc = await Model.findById(id).select('+sessions');
    if (!doc) {
      return res.status(404).json({ status: 'fail', message: 'Hesap bulunamadı.' });
    }

    const sessionIndex = (doc.sessions || []).findIndex(s => s.deviceId === deviceId);
    if (sessionIndex === -1) {
      return res.status(404).json({ status: 'fail', message: 'Oturum bulunamadı.' });
    }

    doc.sessions.splice(sessionIndex, 1);
    await doc.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', message: 'Oturum sonlandırıldı.' });
  } catch (err) {
    next(err);
  }
};

exports.revokeAllSessions = async (req, res, next) => {
  try {
    const { Model, id, cookieName } = resolvePrincipal(req);
    const doc = await Model.findById(id).select('+sessions');
    if (!doc) {
      return res.status(404).json({ status: 'fail', message: 'Hesap bulunamadı.' });
    }

    const rawToken = req.cookies?.[cookieName];
    const currentHashed = rawToken ? sha256(rawToken) : null;

    // Yalnızca mevcut cihaz kalsın; cookie yoksa (ör. bozuk istek) hiçbir oturumu
    // körlemesine silmeyip mevcut oturumu koruyamayacağımız için işlemi reddederiz.
    if (!currentHashed) {
      return res.status(400).json({ status: 'fail', message: 'Geçerli oturum bulunamadı.' });
    }
    doc.sessions = (doc.sessions || []).filter(s => s.refreshTokenHash === currentHashed);

    await doc.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', message: 'Diğer tüm oturumlar sonlandırıldı.' });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { Model, id, cookieName } = resolvePrincipal(req);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'fail', message: 'Mevcut şifre ve yeni şifre gereklidir.' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ status: 'fail', message: 'Yeni şifre en az 8 karakter olmalıdır.' });
    }

    const doc = await Model.findById(id).select('+password +sessions');
    if (!doc) {
      return res.status(404).json({ status: 'fail', message: 'Hesap bulunamadı.' });
    }

    if (!(await doc.correctPassword(currentPassword, doc.password))) {
      return res.status(401).json({ status: 'fail', message: 'Mevcut şifreniz hatalı.' });
    }

    doc.password = newPassword; // pre-save hook bcrypt ile hash'ler

    // Şifre değiştiği için mevcut cihaz dışındaki tüm oturumları kapatıyoruz (güvenlik)
    const rawToken = req.cookies?.[cookieName];
    const currentHashed = rawToken ? sha256(rawToken) : null;
    doc.sessions = currentHashed
      ? (doc.sessions || []).filter(s => s.refreshTokenHash === currentHashed)
      : [];

    await doc.save();

    res.status(200).json({ status: 'success', message: 'Şifreniz başarıyla değiştirildi.' });
  } catch (err) {
    next(err);
  }
};
