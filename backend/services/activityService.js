// Aktivite logu yazımı — FIRE-AND-FORGET: log yazımı asla ana akışı (kaydetme vb.)
// bozmaz; hata olursa yalnızca loglanır. Actor (sahip/çalışan) req.auth'tan çözülür.
const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

async function log({ req, businessId, businessName, action, message, meta }) {
  try {
    if (!businessId || !action || !message) return;

    let actorType = 'owner';
    let actorId = null;
    let actorName = 'İşletme Sahibi';
    const employeeId = req && req.auth && req.auth.employeeId;
    if (employeeId) {
      actorType = 'employee';
      actorId = employeeId;
      const Employee = require('../models/Employee');
      const emp = await Employee.findById(employeeId).select('name');
      actorName = emp && emp.name ? `${emp.name} (çalışan)` : 'Çalışan';
    }

    if (!businessName) {
      const Business = require('../models/Business');
      const b = await Business.findById(businessId).select('name');
      businessName = b ? b.name : undefined;
    }

    await ActivityLog.create({ business: businessId, businessName, actorType, actorId, actorName, action, message, meta });
  } catch (err) {
    logger.error({ err }, 'Aktivite logu yazılamadı');
  }
}

module.exports = { log };
