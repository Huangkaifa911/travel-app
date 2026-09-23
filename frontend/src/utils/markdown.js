// src/utils/markdown.js
import DOMPurify from 'dompurify'
import { marked } from 'marked'
// 1. 仅导入 highlight.js 核心（不含语言包）
import hljs from 'highlight.js/lib/core'
// 2. 按需导入你需要的语言（根据业务场景，通常只需以下几项）
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml' // HTML/XML
import css from 'highlight.js/lib/languages/css'
import markdown from 'highlight.js/lib/languages/markdown'

// 3. 注册语言（可添加别名）
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)

// 配置marked 的代码高亮功能
marked.setOptions({
  highlight: function (code, lang) {
    // 如果语言存在且 highlight.js 支持，则按语言高亮
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (error) {
        return code
      }
    }

    // 否则自动检测语言，或返回普通代码
    try {
      return hljs.highlightAuto(code).value
    } catch (error) {
      return code
    }
  },
})

// ---- 新增：预处理 Markdown 文本，消除格式噪音 ----
function cleanMarkdown(text) {
  let cleaned = text

  // --- 原有清洗 ---
  // 1. 修复行首空格导致标题失效
  cleaned = cleaned.replace(/^[ \t]+(#{1,6}\s)/gm, '$1')
  // 2. 清理中文标点周围空格
  cleaned = cleaned.replace(/\s*([：，。；！？、）】》])\s*/g, '$1')
  cleaned = cleaned.replace(/\s*([（【《])\s*/g, '$1')
  // 3. 英文括号旁空格修正
  cleaned = cleaned.replace(/\s*\(\s*/g, ' (')
  cleaned = cleaned.replace(/\s*\)\s*/g, ') ')

  // --- 新增：确保标题前有换行，且标题独占一行开头 ---
  // 匹配情况：非行首的 #，比如 "文字### 标题" 或 "文字\n### 标题"
  // 我们强制在 # 前插入一个换行（如果前面不是换行或开头的话）
  cleaned = cleaned.replace(/([^\n])(#{1,6}\s)/g, '$1\n$2')
  // 但这样会把行首标题前面也插入换行（本来就在行首，前一个是上一行结尾的 \n，不用处理）
  // 再确保标题符号前没有其他非空白字符

  // 同时确保标题后面有换行（有些模型会写成 ### 标题\n文字，marked能识别，没问题）

  return cleaned
}

// 核心方法：将 Markdown 文本转成安全的 HTML
export function renderMarkdown(text) {
  // 先清洗格式问题
  const cleanedText = cleanMarkdown(text)

  // 解析 Markdown 文本为原始 HTML
  // 注意：这里使用 marked.parse 而不是 marked.parseOptions，因为 marked.parseOptions 是一个旧的 API，不支持自定义选项
  const rawHtml = marked.parse(cleanedText)
  // 2. 消毒，防止 XSS 攻击
  const cleanHtml = DOMPurify.sanitize(rawHtml)
  return cleanHtml
}
