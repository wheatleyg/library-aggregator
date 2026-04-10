import type { H3Event } from 'h3'

// Must be ≥ 32 chars for h3's HMAC. Set SESSION_SECRET in .env for production.
const SESSION_PASSWORD = process.env.SESSION_SECRET ?? 'dev-secret-change-this-in-production!!'

export interface AdminSessionData {
  loggedIn: boolean
  username: string
}

export function getAdminSession(event: H3Event) {
  return useSession<AdminSessionData>(event, {
    password: SESSION_PASSWORD,
    maxAge: 60 * 60 * 8, // 8 hours
    name: 'fc-admin'
  })
}
