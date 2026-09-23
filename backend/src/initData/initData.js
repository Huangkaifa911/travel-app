import connectDB from '../utils/mongoDB.js';
import mongoose from 'mongoose';
import City from '../models/cityModels.js';


const cityData = [
    {
    name: '厦门',
    desc: '海上花园，文艺清新',
    image: '/api/images/1.webp',
    tags: ['海岛', '鼓浪屿', '小吃'],
    price: 1800,
    hot: false,
  },
  {
    name: '北京',
    desc: '千年古都，皇家风范',
    image: '/api/images/2.webp',
    tags: ['故宫', '长城', '胡同'],
    price: 2200,
    hot: true,
  },
  {
    name: '成都',
    desc: '天府之国，休闲之都',
    image: '/api/images/3.webp',
    tags: ['大熊猫', '火锅', '宽窄巷子'],
    price: 1600,
    hot: true,
  },
  {
    name: '杭州',
    desc: '人间天堂，江南水乡',
    image: '/api/images/4.webp',
    tags: ['西湖', '断桥', '龙井茶'],
    price: 1900,
    hot: true,
  },
  {
    name: '西安',
    desc: '十三朝古都，历史名城',
    image: '/api/images/5.webp',
    tags: ['兵马俑', '古城墙', '肉夹馍'],
    price: 1700,
    hot: false,
  },
  {
    name: '重庆',
    desc: '山城雾都，魔幻之都',
    image: '/api/images/6.webp',
    tags: ['火锅', '轻轨穿楼', '洪崖洞'],
    price: 1500,
    hot: true,
  },
  {
    name: '上海',
    desc: '东方明珠，国际都市',
    image: '/api/images/7.webp',
    tags: ['外滩', '迪士尼', '陆家嘴'],
    price: 2500,
    hot: false,
  },
  {
    name: '丽江',
    desc: '高原姑苏，浪漫古城',
    image: '/api/images/8.webp',
    tags: ['古城', '雪山', '纳西文化'],
    price: 2000,
    hot: false,
  },
  {
    name: '青岛',
    desc: '海滨之城，欧韵风情',
    image: '/api/images/9.webp',
    tags: ['栈桥', '啤酒', '八大关'],
    price: 1600,
    hot: false,
  },
  {
    name: '南京',
    desc: '六朝古都，金陵雅韵',
    image: '/api/images/10.webp',
    tags: ['中山陵', '夫子庙', '秦淮河'],
    price: 1700,
    hot: false,
  },
]


const addCityData = async () => {
  try {
    // 连接数据库
    await connectDB();

    // 清空数据库
    await City.deleteMany({});
    console.log('数据库清空成功');

    // 插入城市数据
    await City.insertMany(cityData);
    console.log('城市数据插入成功');

    // 断开数据库连接
    await mongoose.disconnect();
    console.log('数据库连接已断开');



  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

addCityData();