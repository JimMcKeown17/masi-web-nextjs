export const FINANCE_READ_CAPABILITY = "finance.read";

export function canAccessFinance(capabilities: unknown): boolean {
  return Array.isArray(capabilities) && capabilities.includes(FINANCE_READ_CAPABILITY);
}

export function canPublishFinance(capabilities: unknown): boolean {
  return canAccessFinance(capabilities) && Array.isArray(capabilities) && capabilities.includes("finance.publish");
}
