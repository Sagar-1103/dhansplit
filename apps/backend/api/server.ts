import { prisma } from "@repo/db";
import { env } from "../src/constants/env";

const server = Bun.serve({
  port: env.PORT,
  routes: {
    "/api/health": () =>
      Response.json(
        { success: true },
        {
          headers: {
            "Access-Control-Allow-Origin": env.CORS_ORIGIN,
          },
        }
      ),
      "/api/auth/users": async() => {
        const count = await prisma.user.count({});
        return Response.json(
          { success: true, count },
          {
            headers: {
              "Access-Control-Allow-Origin": env.CORS_ORIGIN,
            },
          }
        )
      }
      
  },
  fetch(req: Request) {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": env.CORS_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const headers = {
      "Access-Control-Allow-Origin": env.CORS_ORIGIN,
      "Content-Type": "application/json",
    };

    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
      headers,
    });
  },
});

console.log(`Server is running on port ${server.port}`);
