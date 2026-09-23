export default function streamResponse(res) {
  // 设置响应头-流式数据
  res.setHeader('Content-Type', 'text/event-stream');
  // 禁用缓存
  res.setHeader('Cache-Control', 'no-cache');
  // 保持连接
  res.setHeader('Connection', 'keep-alive');

  return{
      // 发送数据
  send: (chunk) => {
    // 将大模型返回的数据转化为JSON字符串
    res.write(`data: ${JSON.stringify(chunk)}\n`);
    res.write('\n');
  },
  end: () => {
    // 发送结束信号
    res.write('data: [DONE]\n');
    res.end();
  },
  error: (err) => {
    // 发送错误信号
    res.write('data: [ERROR]\n');
    res.end(JSON.stringify({ error: err.message }));
  }
}
}