import { api } from './client'

export interface ChatRequest {
  message: string
}

export interface ChatResponse {
  message: string
}

export const chatWithAI = async (message: string): Promise<string> => {
  const { data } = await api.post<ChatResponse>('/ai/chat', { message })
  return data.message
}

