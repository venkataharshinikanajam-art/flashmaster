import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../src/models/User.js";

const email = process.argv[2];

if (!email) {
  console.error("Missing email. Usage: node scripts/make-admin.js <email>");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not set. Set it in .env or pass it inline.");
  process.exit(1);
}

const run = async () => {
  console.log(`Connecting to ${uri.includes("mongodb+srv") ? "Atlas (production)" : "local MongoDB"}...`);
  await mongoose.connect(uri);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { role: "admin" },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email: ${email}`);
  } else {
    console.log(`${user.email} is now an ADMIN (role: ${user.role})`);
  }

  await mongoose.disconnect();
  process.exit(user ? 0 : 1);
};

run().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
