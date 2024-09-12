// @ts-nocheck
import mongoose from 'mongoose'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'

// User Schema Definition
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isVerifiedDriver: {
        type: Boolean,
        default: false
    },
    isDocumentSubmited: {
        type: Boolean,
        default: false
    },
    driverDocuments: [
        {
            docName: String,
            public_id: String,
            url: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    haveCab: {
        type: Boolean,
        default: false
    },
    avatar: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        enum: ['Passenger', 'Driver', 'Admin'],
        default: 'Passenger'
    },
    wallet: {
        balance: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'INR'
        },
        bankDetails: {
            accNo: {
                type: Number,
                required: true
            },
            ifsc: {
                type: String,
                required: true
            },
            bankName: {
                type: String,
                required: true
            }
        },
        transactionHistory: [
            {
                type: {
                    type: String, // 'credit' or 'debit'
                    enum: ['credit', 'debit'],
                    required: true
                },
                amount: {
                    type: Number,
                    required: true
                },
                transactionDate: {
                    type: Date,
                    default: Date.now
                },
                description: String
            }
        ]
    },
    otp: Number,
    otp_expiry: Date,
    otp_attempt: Number,
    resetPasswordOtp: Number,
    resetPasswordOtpExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Pre-save Hook to Hash Password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    try {
        this.password = await argon2.hash(this.password)
        next()
    } catch (err) {
        next(err)
    }
})

// JWT Token Generation Method
userSchema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, config.JWT_SECRET, {
        expiresIn: config.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Converts days to milliseconds
    })
}

// Password Verification Method
userSchema.methods.verifyPassword = async function (plainTextPassword) {
    try {
        return await argon2.verify(this.password, plainTextPassword)
        // eslint-disable-next-line no-unused-vars
    } catch (err) {
        return false
    }
}

// TTL Index for OTP Expiry
userSchema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 })

// Indexes for Email and PhoneNumber
userSchema.index({ email: 1 })
userSchema.index({ phoneNumber: 1 })

// User Model Export
export const User = mongoose.model('User', userSchema)
