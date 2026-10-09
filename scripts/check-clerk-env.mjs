function keyType(value, prefix) {
  if (!value) return "MISSING";
  if (value.startsWith(`${prefix}_live_`)) return `${prefix}_live`;
  if (value.startsWith(`${prefix}_test_`)) return `${prefix}_test`;
  return "UNKNOWN";
}

function decodeClerkHost(key) {
  if (!key) return "MISSING";

  try {
    const encoded = key.replace(/^pk_(live|test)_/, "");
    const decoded = Buffer.from(encoded, "base64")
      .toString("utf8")
      .replace(/\$$/, "");

    return decoded || "UNKNOWN";
  } catch {
    return "DECODE_FAILED";
  }
}

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secretKey = process.env.CLERK_SECRET_KEY;

console.log("=== SAFE CLERK BUILD DIAGNOSTIC ===");
console.log("Publishable key type:", keyType(publishableKey, "pk"));
console.log("Embedded Clerk frontend:", decodeClerkHost(publishableKey));
console.log("Secret key type:", keyType(secretKey, "sk"));
console.log("=== END SAFE CLERK BUILD DIAGNOSTIC ===");
