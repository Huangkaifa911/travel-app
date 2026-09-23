import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {        
      type: String,
      required: true,   // 必填
      unique: true,     // 全局唯一，不能重复注册
      trim: true,       // 去掉首尾空格
      minlength: 3,
      maxlength: 20, 
    },
    password: {
      type: String,
      required: true,
      select: false,    // ⭐ 关键！默认查询时不返回这个字段
    },
    nickname: {
      type: String,
      default: '',
    },
    
}, { timestamps: true } )

export default mongoose.model('User', userSchema);