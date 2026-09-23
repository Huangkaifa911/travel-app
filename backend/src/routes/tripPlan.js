import express from 'express'
import tripPlanService from '../services/tripPlanService.js'
import { authMiddleware } from '../middlewares/auth.js'


const router = express.Router()

router.use(authMiddleware)

// 保存行程
router.post('/', async (req, res, next) => {
  try {
    const plan = await tripPlanService.create(req.userId, req.body)
    res.json({
      success: true,
      data: plan,
      message: '行程保存成功',
    })
  } catch (error) {
    next(error)
  }
})

// 获取行程列表
router.get('/', async (req, res, next) => {
  try {
    const list = await tripPlanService.list(req.userId)
    res.json({
      success: true,
      data: list,
      message: '行程列表获取成功',
    })
  } catch (error) {
    next(error)
  }
})

// 获取行程详情
router.get('/:id', async (req, res, next) => {
    try {
      if (!req.params.id || req.params.id.length !== 24) {
        throw new AppError('无效行程id', 400)
      }
      const plan = await tripPlanService.getDetail(req.userId, req.params.id)
      res.json({
        success: true,
        data: plan,
        message: '行程详情获取成功',
      })
    } catch (error) {
      next(error)
    }
})

// 删除行程
router.delete('/:id', async (req, res, next) => {
  try {
    if (!req.params.id || req.params.id.length !== 24) {
      throw new AppError('无效行程id', 400)
      }
    await tripPlanService.remove(req.userId, req.params.id, )
    res.json({
      success: true,
      message: '行程删除成功',
    })
  } catch (error) {
    next(error)
  }
})

export default router