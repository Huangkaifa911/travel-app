import request from '@/utils/request'

export const listConversations = () => request.get('/conversations')
export const createConversation = () => request.post('/conversations')
export const getConversationDetail = (id) => request.get(`/conversations/${id}`)
export const deleteConversation = (id) => request.delete(`/conversations/${id}`)
