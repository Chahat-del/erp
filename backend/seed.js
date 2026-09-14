/**
 * Run this once to create the admin account:
 * node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: 'admin@mgsolutions.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  await User.create({
    name: 'MG Solutions Admin',
    email: 'admin@mgsolutions.com',
    password: 'Admin@123',
    role: 'admin',
    department: 'Management',
    designation: 'System Administrator',
    isActive: true
  });

  console.log('✅ Admin created!');
  console.log('Email: admin@mgsolutions.com');
  console.log('Password: Admin@123');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
