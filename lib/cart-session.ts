const SESSION_KEY = "goraya-cart-session-v1"

/** Stable browser session id — used as cart key in MongoDB for guests */
export function getOrCreateCartSessionId(): string {
  if (typeof window === "undefined") return "server"
  try {
    let id = localStorage.getItem(SESSION_KEY)
    if (!id) {
      id = `cart-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      localStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return `cart-${Date.now()}`
  }
}
