import TripPlan from '../models/TripPlan.js'
import { AppError } from '../utils/appError.js'

class TripPlanService {
  // 创建行程
  async create(userId, { destination,days, budget, planData}) {
    if (!destination || !days || !budget || !planData) {
      throw new AppError('请提供完整的行程信息', 400)
    }
    const tripPlan = await TripPlan.create({
      userId,
      destination,
      days,
      budget,
      planData,
    })
    return tripPlan
  }

  // 获取行程列表
  async list(userId) {
    const list = await TripPlan.find({userId}).select('-planData').sort({createdAt: -1}).lean() // 不返回 planData 字段，只返回其他字段
    console.log(list)
    return list
  }

  // 获取行程详情
  async getDetail(userId, id) {
    const plan = await TripPlan.findOne({ _id:id, userId })
    if (!plan) {
      throw new AppError('行程不存在', 404)
    }
    return plan
  }

  // 删除行程
  async remove(userId, id) {
    const plan = await TripPlan.findOne({ _id:id, userId })
    if (!plan) {
      throw new AppError('行程不存在', 404)
    }
    await plan.deleteOne()
  }
}

export default new TripPlanService()