const Employee = require('../models/Employee');

exports.createEmployee = async (req, res, next) => {
  try {
    // Only the main business can create employees
    if (req.auth.employeeId) {
      return res.status(403).json({ status: 'fail', message: 'Sadece ana işletme çalışan ekleyebilir.' });
    }

    const { name, email, password, allowedPages, branchIds, branchId } = req.body;
    const finalBranchIds = branchIds || (branchId ? [branchId] : []);

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ status: 'fail', message: 'Bu e-posta adresi ile zaten bir çalışan var.' });
    }

    const Business = require('../models/Business');
    let targetBusinessId = req.auth.id;
    let validatedBranchIds = [];
    
    if (finalBranchIds.length > 0) {
      for (const id of finalBranchIds) {
        if (id === String(req.auth.id)) {
          validatedBranchIds.push(id);
        } else {
          const targetBranch = await Business.findOne({ _id: id, parentBusinessId: req.auth.id });
          if (targetBranch) {
            validatedBranchIds.push(id);
          }
        }
      }
      if (validatedBranchIds.length === 0) {
        return res.status(400).json({ status: 'fail', message: 'Geçerli şube seçilmedi.' });
      }
      targetBusinessId = validatedBranchIds[0];
    } else {
      validatedBranchIds = [targetBusinessId];
    }

    const employee = await Employee.create({
      business: targetBusinessId,
      allowedBranches: validatedBranchIds,
      name,
      email,
      password,
      allowedPages: allowedPages || []
    });

    res.status(201).json({ status: 'success', data: { employee: employee.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    if (req.auth.employeeId) {
      return res.status(403).json({ status: 'fail', message: 'Sadece ana işletme çalışanları görebilir.' });
    }

    const Business = require('../models/Business');
    const current = await Business.findById(req.auth.id);
    let businessIds = [req.auth.id];

    if (current && current.branchType === 'zincir') {
      const branches = await Business.find({ parentBusinessId: req.auth.id });
      businessIds = [...businessIds, ...branches.map(b => b._id)];
    }

    const employees = await Employee.find({ business: { $in: businessIds } })
      .populate('business', 'name branchName')
      .populate('allowedBranches', 'name branchName')
      .sort('-createdAt');
      
    res.status(200).json({ 
      status: 'success', 
      data: { 
        employees: employees.map(e => {
          const json = e.toSafeJSON();
          json.businessName = e.business?.branchName ? `${e.business.name} - ${e.business.branchName}` : e.business?.name;
          if (e.allowedBranches && e.allowedBranches.length > 1) {
            json.businessName += ` (+${e.allowedBranches.length - 1} Şube)`;
          }
          json.businessId = e.business?._id || e.business;
          json.allowedBranches = e.allowedBranches || [];
          return json;
        }) 
      } 
    });
  } catch (err) {
    next(err);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    if (req.auth.employeeId) {
      return res.status(403).json({ status: 'fail', message: 'Sadece ana işletme yetkileri güncelleyebilir.' });
    }

    const { allowedPages, password, branchIds, branchId } = req.body;
    const finalBranchIds = branchIds || (branchId ? [branchId] : []);

    const Business = require('../models/Business');
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ status: 'fail', message: 'Çalışan bulunamadı.' });
    }

    let targetBusinessId = employee.business;
    let validatedBranchIds = employee.allowedBranches || [employee.business];

    if (finalBranchIds.length > 0) {
      validatedBranchIds = [];
      for (const id of finalBranchIds) {
        if (id === String(req.auth.id)) {
          validatedBranchIds.push(id);
        } else {
          const targetBranch = await Business.findOne({ _id: id, parentBusinessId: req.auth.id });
          if (targetBranch) {
            validatedBranchIds.push(id);
          }
        }
      }
      if (validatedBranchIds.length > 0) {
        targetBusinessId = validatedBranchIds[0];
      }
    }

    if (allowedPages) employee.allowedPages = allowedPages;
    if (password) employee.password = password;
    if (validatedBranchIds.length > 0) {
      employee.business = targetBusinessId;
      employee.allowedBranches = validatedBranchIds;
    }

    await employee.save();

    res.status(200).json({ status: 'success', data: { employee: employee.toSafeJSON() } });
  } catch (err) {
    next(err);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    if (req.auth.employeeId) {
      return res.status(403).json({ status: 'fail', message: 'Sadece ana işletme çalışan silebilir.' });
    }

    const employee = await Employee.findOneAndDelete({ _id: req.params.id, business: req.auth.id });

    if (!employee) {
      return res.status(404).json({ status: 'fail', message: 'Çalışan bulunamadı.' });
    }

    res.status(200).json({ status: 'success', message: 'Çalışan silindi.' });
  } catch (err) {
    next(err);
  }
};
