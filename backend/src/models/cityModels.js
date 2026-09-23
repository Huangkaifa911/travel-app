import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
    name: { type: String, required: true },
  desc: { type: String, required: true },
  image: { type: String, required: true }, // 图片路径，如 /images/xiamen.jpg
  tags: { type: [String], default: [] },
  price: { type: Number, required: true },
  hot: { type: Boolean, default: false },
})

// 创建城市模型
const City = mongoose.model('City', citySchema);

export default City;
