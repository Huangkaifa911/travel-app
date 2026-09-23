import mongoose from 'mongoose'

const tripPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    days: {
      type: Number,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    // ⭐ 整个 AI 生成的行程 JSON 直接塞进来
    planData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
)

// 复合索引：查我的行程，按最近保存排序
tripPlanSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('TripPlan', tripPlanSchema)