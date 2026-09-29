import type { ZodSchema } from "zod";
import { ZodError } from "zod";

export function validate(schema: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema }): any {
  return (handler: any) => {
    return async (req: Request, params?: any, userId?: string) => {
      try {
        if (schema.body) {
          const body = await req.clone().json();
          schema.body.parse(body);
        }
        if (schema.query) {
          const url = new URL(req.url);
          const query = Object.fromEntries(url.searchParams.entries());
          schema.query.parse(query);
        }
        if (schema.params) {
          schema.params.parse(params || {});
        }
        return handler(req, params, userId);
      } catch (err) {
        if (err instanceof ZodError) {
          return Response.json({
            success: false,
            message: "Validation failed",
            errors: err.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          }, { status: 400 });
        }
        throw err;
      }
    };
  };
}
