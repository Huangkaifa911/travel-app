import { ChatOpenAI } from "@langchain/openai";   
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import 'dotenv/config';
import JSON5 from 'json5';
class TravelService {
  constructor() {
    this.llm = null
    this.initLLM()
  }

  // 配置大模型参数
  initLLM(){
    let apiKey, baseURL, model 
    apiKey = process.env.SILICONFLOW_API_KEY
    baseURL = process.env.SILICONFLOW_BASE_URL
    if(process.env.AI_MODEL === "Qwen"){
      model = process.env.SILICONFLOW_Qwen_MODEL
    }else{
      model = process.env.SILICONFLOW_THUDM_MODEL
    }

    this.llm = new ChatOpenAI({
      configuration: {
        baseURL,
      },
      apiKey,
      model,
      temperature: 0.2,
      maxTokens: 16384,
      // stream: true,
    })
  }
  // 生成提示词
  getPrompt(destination, days, budget){
    return new HumanMessage(`你是一位专业的旅行规划师。请根据用户提供的目的地、天数、预算，生成一份结构化的行程 JSON。

**核心要求：**
1. 总花费（cost_breakdown.total）为整数，不超过预算。
2. 每天的行程分【上午】【下午】【晚上】三个时段，每个时段 2~3 个具体子活动。
3. 早餐、午餐、晚餐必须作为子活动出现，写明店铺名和招牌菜。
4. 地点切换写明交通方式（如“步行200米至地铁B口，乘2号线坐2站”）。
5. 若天数超过 7 天，每隔 6~7 天插入 1 天“休整日”（花费降至日常的 30%）。

**格式硬性要求（必须严格遵守）：**
- 只返回纯 JSON，不要任何解释、前言、后语，不要用 Markdown 代码块。
- 所有字符串用英文双引号包裹；字符串内部不要出现英文双引号，需要引用时用中文引号「」。
- 所有数字字段必须是纯数字，不能带单位（写 50，不要写 "50元"）。
- 不要写算术表达式，所有数字直接写结果（写 500，不要写 100+200+200=500）。
- 所有括号必须严格配对：{ 对应 }，[ 对应 ]。数组结束时必须写 ]，对象结束时必须写 }。
- JSON 必须从 { 开始，以 } 结束，中间不能有任何截断。

**严格按以下结构返回（字段名和层级不能变）：**
{
  "destination": "目的地",
  "days": 数字,
  "budget": 数字,
  "summary": "总览（突出免费政策、省钱技巧）",
  "itinerary": [
    {
      "day": 1,
      "date": "Day 1",
      "schedule": [
        {
          "period": "上午",
          "activities": [
            {
              "time": "08:00-09:00",
              "activity": "活动描述",
              "location": "具体地点",
              "cost": 数字,
              "transport": "交通方式",
              "note": "小贴士"
            }
          ]
        }
      ],
      "accommodation": { "name": "酒店名", "cost": 数字, "note": "备注" },
      "transport_total": 数字,
      "daily_total": 数字
    }
  ],
  "cost_breakdown": { "attractions": 数字, "meals": 数字, "accommodation": 数字, "transport": 数字, "other": 数字, "total": 数字 },
  "tips": "交通卡绑定、日落时间、雨天备选方案"
}

用户输入：
目的地：${destination}
天数：${days}
预算：${budget}`)
  }


  // 生成推荐攻略
  async recommend(destination, days, budget){
    // 生成提示词
    const prompt = this.getPrompt(destination, days, budget)
    // 调用大模型
    try {
      const res = await this.llm.invoke([prompt]) 
      console.log('🔥🔥🔥 recommend 被调用了', new Date().toISOString())   // ⭐ 加这行
      console.log(res.content)


      const jsonStr = this.extractJSON(res.content)

    //  console.log(res)
      const plan = JSON5.parse(jsonStr)
      
     return plan
    } catch (error) {
    console.error('推荐生成失败:', error.message)
    throw error   // ⭐ 抛出去，让路由层统一处理
    }
  }

  // ai
  async chat(message, callback) {
    const messages = [new HumanMessage(message), 
      new SystemMessage(`你是一个专业的旅行规划师和向导，你知道世界各个城市的信息，根据客户提出关于旅行的问题，提供专业的建议。要求使用markdown格式输出，排序需要换行显示，每个选项之间用空行隔开`)]

    // 调用大模型
    try {
          const stream = await this.llm.stream(messages)
            let fullResponse = ''
            for await (let chunk of stream) {
              chunk = chunk.content || ''
              if(chunk.trim() === ''){
                continue
              }
              // 拼接数据
              fullResponse += chunk
                if(callback) {
                  callback(chunk)
                }
          }
          return {
            success: true,
            response: fullResponse
          }
    } catch (error) {
      throw new Error(error.message)
    }
  }

extractJSON(str) {
  if (typeof str !== 'string') {
    if (str === null || str === undefined) throw new Error('响应内容为空')
    str = typeof str === 'object' ? JSON.stringify(str) : String(str)
  }

  // 1. 去 Markdown 代码块
  let cleaned = str.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()

  // 2. 定位第一个 { 和最后一个 }
  const firstBrace = cleaned.indexOf('{')
  if (firstBrace === -1) throw new Error('未找到 JSON 起始符 {')

  const lastBrace = cleaned.lastIndexOf('}')
  let candidate =
    lastBrace > firstBrace
      ? cleaned.substring(firstBrace, lastBrace + 1)
      : cleaned.substring(firstBrace)

  // ===== 3. 修复算术表达式 =====

  // 3.1 带 = 的：265+610+740+200=1815 → 1815
  // ⭐ 用最宽松的策略：只要有 "数字+数字...=数字"，直接用 = 后面的数字
  candidate = candidate.replace(
    /(\d+(?:\.\d+)?(?:\s*[+\-*/]\s*\d+(?:\.\d+)?)+)\s*=\s*(\d+(?:\.\d+)?)/g,
    (match, expr, result) => result   // 直接用 = 后面的结果，不重新算
  )

  // 3.2 无 = 的：": 50+30," → ": 80,"  （支持任意多个数字相加）
  let prev
  do {
    prev = candidate
    candidate = candidate.replace(
      /:(\s*)(\d+(?:\.\d+)?(?:\s*\+\s*\d+(?:\.\d+)?)+)(\s*[,}])/g,
      (_, sp1, expr, sp2) => {
        const sum = expr
          .split('+')
          .map((n) => parseFloat(n.trim()))
          .reduce((a, b) => a + b, 0)
        return `:${sp1}${sum}${sp2}`
      }
    )
  } while (candidate !== prev)

  // ===== 4. 清理尾逗号 =====
  candidate = candidate.replace(/,(\s*[}\]])/g, '$1')

  // ===== 5. 直接尝试解析 =====
  try {
    JSON5.parse(candidate)
    return candidate
  } catch (e) {
    var parseError = e
  }

  // ===== 6. 末尾补 } 或 ] =====
  for (let extra = 1; extra <= 3; extra++) {
    const sub = candidate + '}'.repeat(extra)
    try {
      JSON5.parse(sub)
      console.warn(`[extractJSON] 补全 ${extra} 个 }`)
      return sub
    } catch (e) {}
  }

  for (let eb = 1; eb <= 3; eb++) {
    for (let ec = 1; ec <= 3; ec++) {
      const sub = candidate + ']'.repeat(eb) + '}'.repeat(ec)
      try {
        JSON5.parse(sub)
        console.warn(`[extractJSON] 补全 ${eb} 个 ] 和 ${ec} 个 }`)
        return sub
      } catch (e) {}
    }
  }

  // ===== 7. 全失败 → 详细错误 =====
  console.error('[extractJSON] 解析失败')
  console.error('[extractJSON] 错误:', parseError?.message)
  console.error('[extractJSON] 候选长度:', candidate.length)

  const posMatch = parseError?.message?.match(/position (\d+)/)
  if (posMatch) {
    const pos = parseInt(posMatch[1])
    console.error(
      '[extractJSON] 错误位置附近 200 字:',
      candidate.slice(Math.max(0, pos - 100), pos + 100)
    )
  } else {
    console.error('[extractJSON] 候选前 200 字:', candidate.slice(0, 200))
    console.error('[extractJSON] 候选后 200 字:', candidate.slice(-200))
  }

  throw new Error('无法从响应中提取有效的 JSON')
}


}

export default new TravelService();
