import mongoose from 'mongoose';

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    console.log(`MONGO_URI: ${process.env.MONGO_URI}`);
  } catch (error) {
    console.log(`Error connection to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectMongoDB;
