const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const transactionSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  guestId: { type: String, required: true },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING",
  },
  paymentMethod: {
    type: String,
    enum: ["Pesapal", "MPesa"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔐 Add field-level encryption
const encKey = process.env.ENCRYPTION_SECRET;
transactionSchema.plugin(encrypt, {
  secret: encKey,
  encryptedFields: ["email", "phone", "description"],
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
