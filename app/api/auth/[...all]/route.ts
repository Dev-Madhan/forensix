import { auth } from "@/lib/auth"; // Assumes Next.js compiler resolves @/lib to lib
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
