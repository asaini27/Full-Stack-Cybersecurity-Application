export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function basicHeader(username: string, password: string) {
  // matches backend's DEV "Basic username:password" (not real Basic)
  return { 'Authorization': `Basic ${username}:${password}` }
}
