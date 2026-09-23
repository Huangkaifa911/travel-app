import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

// 硬编码密钥

// const JWT_SECRET = 'dev-secret-change-me-later'

class AuthService {
  // 注册
  async register({ username, password, nickname}) {
    // 1.检查用户名和参数
    if (!username || !password) {
      throw new Error('用户名和密码不能为空');
    }
    if (password.length < 6) {
      throw new Error('密码长度不能小于6位');
    }

    // 2.检查用户名是否存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 3.加密密码
    const hash = await bcrypt.hash(password, 10);

    // 4.存数据库
    const user = await User.create({
      username,
      password: hash,
      nickname : nickname || username,
    })

    // 5.生成token返回
    const token = jwt.sign(
      { userId: user._id.toString() }, // payload：塞进身份证里的信息
      config.jwtSecret, // 密钥：用来签名
      { expiresIn: '7d' } // 7 天后过期
    )
    
    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
      }
    }
  }

  // 登录
  async login({ username, password }) {
    // 1.检查用户名和密码
    if (!username || !password) {
      throw new Error('用户名和密码不能为空');
    }

    // 2.查询用户-使用select（'+password'），查询时包括用户密码
    const user = await User.findOne({username}).select('+password');
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 3.检查密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('用户名或密码错误');
    }

    // 4.生成token
    const token = jwt.sign(
      { userId: user._id.toString() }, // payload：塞进身份证里的信息
      config.jwtSecret, // 密钥：用来签名
      { expiresIn: '7d' } // 7 天后过期
    )

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        nickname: user.nickname,
      }
    }
  }
}

export default new AuthService();
