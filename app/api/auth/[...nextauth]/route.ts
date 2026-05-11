// app/api/auth/[...nextauth]/route.ts
// Auth.js route handler — exposes /api/auth/* endpoints.

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
