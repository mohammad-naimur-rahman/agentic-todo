import mongoose from 'mongoose'

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/todo-app'

// Extend the NodeJS.Global interface to include a `mongoose` property
declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null
    promise: Promise<mongoose.Mongoose> | null
  }
}

// Ensure global.mongoose exists
global.mongoose = global.mongoose || { conn: null, promise: null }

async function connectDB(): Promise<mongoose.Mongoose> {
  if (global.mongoose.conn) {
    return global.mongoose.conn
  }

  if (!global.mongoose.promise) {
    const opts = { bufferCommands: false }
    global.mongoose.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(mongoose => mongoose)
  }

  global.mongoose.conn = await global.mongoose.promise
  return global.mongoose.conn
}

export default connectDB
