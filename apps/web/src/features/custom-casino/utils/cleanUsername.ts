// @ts-nocheck
export const cleanUsername = (value: string) =>
  (value || '').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase()

export default cleanUsername
