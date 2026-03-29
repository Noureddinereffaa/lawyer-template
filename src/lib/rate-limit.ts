/**
 * Basic in-memory rate limiter for Vercel Serverless/Edge functions.
 * Note: Since Vercel instances are ephemeral, this limits requests *per active instance*.
 * It's enough to stop basic spam and simple bots hitting the same instance repeatedly.
 */

// Store format: { IP: { count: number, resetTime: number } }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (
  ip: string,
  limit: number = 3,       // Max requests
  windowMs: number = 60000 // Time window in milliseconds (e.g., 1 min)
): { success: boolean; limit: number; remaining: number; reset: number } => {
  const now = Date.now();
  const resetTime = now + windowMs;

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { success: true, limit, remaining: limit - 1, reset: resetTime };
  }

  const record = rateLimitMap.get(ip)!;

  // Window expired? Reset count.
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = resetTime;
    return { success: true, limit, remaining: limit - 1, reset: resetTime };
  }

  // Still within window. Increment and check.
  record.count += 1;
  const remaining = Math.max(0, limit - record.count);

  if (record.count > limit) {
    return { success: false, limit, remaining: 0, reset: record.resetTime };
  }

  return { success: true, limit, remaining, reset: record.resetTime };
};
