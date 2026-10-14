export const TRANSFER_RETURN_PATH = "/dashboard/transfer";
export const TRANSFER_LOGIN_PATH = "/login?returnTo=%2Fdashboard%2Ftransfer";

/** Only the transfer page may override the normal post-login destination. */
export function safePostLoginPath(value: unknown) {
  return value === TRANSFER_RETURN_PATH ? TRANSFER_RETURN_PATH : "/dashboard";
}
