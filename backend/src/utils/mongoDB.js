import mongoose from 'mongoose';

const dbUrl = 'mongodb://127.0.0.1:27017/hkfData';

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