import crypto from "node:crypto"

/** 192 bits of randomness, URL-safe. */
export const newToken = () => crypto.randomBytes(24).toString("base64url")
/** Only the hash of approval tokens is stored. */
export const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex")
