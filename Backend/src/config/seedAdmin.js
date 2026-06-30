import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js'; 
import connectDB from './db.js';

const seedAdmin = async () => {
  try {
    // 1. Connect to your MongoDB Atlas
    await connectDB();

    // 2. Define your admin details here 
    const adminEmail = "admin@nethrolabs.com"; 
    const plainPassword = "123456789"; // Change this to your desired password

    // 3. Check if the admin already exists
    const adminExists = await User.findOne({ email: adminEmail });
    if (adminExists) {
      console.log(`ℹ️ Admin with email ${adminEmail} already exists.`);
      process.exit(0);
    }

    // 4. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 5. Save the new admin to the database
    const newAdmin = new User({
      name: "Nethro Labs Admin",
      email: adminEmail,
      password: hashedPassword,
      role: 'admin', // Critical field to grant admin privileges
      isVerified: true
    });

    await newAdmin.save();
    console.log(`\n✅ Admin user created successfully!`);
    console.log(`📧 Email: ${adminEmail}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();