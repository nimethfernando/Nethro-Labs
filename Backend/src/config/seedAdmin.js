import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js'; 
import connectDB from './db.js';

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@nethrolabs.com"; 
    const plainPassword = "123456789"; 

    // 1. Delete any existing bad admin records so we start fresh
    await User.deleteMany({ email: adminEmail });
    console.log(`🧹 Cleared previous entries for ${adminEmail}`);

    // 2. Pass the PLAIN password. The User model's pre-save hook will hash it perfectly ONCE.
    const newAdmin = new User({
      name: "Nethro Labs Admin",
      email: adminEmail,
      password: plainPassword, 
      role: 'admin', 
      isVerified: true
    });

    await newAdmin.save();
    console.log(`\n✅ Clean admin user created successfully!`);
    console.log(`📧 Email: ${adminEmail}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();