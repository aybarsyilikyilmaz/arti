const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Business = require('./models/Business');

dotenv.config();

const fixBranches = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const branches = await Business.find({ branchType: 'tek', parentBusinessId: { $ne: null } });
    
    for (const branch of branches) {
      if (branch.name && branch.name.includes(' Moda')) {
        branch.name = branch.name.replace(' Moda', '');
        branch.branchName = 'Moda';
        await branch.save();
        console.log(`Updated branch: ${branch._id}`);
      }
      if (branch.name && branch.name.includes(' Caferağa')) {
        branch.name = branch.name.replace(' Caferağa', '');
        branch.branchName = 'Caferağa';
        await branch.save();
        console.log(`Updated branch: ${branch._id}`);
      }
    }
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixBranches();
