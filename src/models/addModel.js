import mongoose from 'mongoose'

// Image schema for the banners
const imageSchema = new mongoose.Schema({
    public_id: { type: String },
    url: { type: String }
})

// Advertisment schema with three possible banners
const addSchema = new mongoose.Schema({
    bannerFirst: { type: imageSchema, default: {} },
    bannerSecond: { type: imageSchema, default: {} },
    bannerThird: { type: imageSchema, default: {} }
})

export const Advertisment = mongoose.model('Advertisment', addSchema)
