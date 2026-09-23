import mongoose from 'mongoose';
import { config } from '../config/index.js'

const dbUrl = config.mongoUrl;

const connectDB = async () => {
try {
    await mongoose.connect(dbUrl);
    console.log('数据库连接成功');
} catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
}
}

export default connectDB;