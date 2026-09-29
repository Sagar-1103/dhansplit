import dotenv from "dotenv";
dotenv.config();

function requiredEnv<T = string>(key: string): T {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value as unknown as T;
}

function optionalEnv<T>(key: string, defaultValue: T): T {
  const value = process.env[key];
  if (value === undefined) {
    return defaultValue;
  }
  if (typeof defaultValue === "number") {
    return Number(value) as unknown as T;
  }
  if (typeof defaultValue === "boolean") {
    return (value === "true" || value === "1") as unknown as T;
  }
  return value as unknown as T;
}

export const env = {
  DATABASE_URL: requiredEnv("DATABASE_URL"),
  JWT_ACCESS_SECRET: requiredEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: requiredEnv("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRY: optionalEnv("JWT_ACCESS_EXPIRY", "15m"),
  JWT_REFRESH_EXPIRY: optionalEnv("JWT_REFRESH_EXPIRY", "7d"),
  PORT: optionalEnv("PORT", 3000),
  NODE_ENV: optionalEnv<"development" | "production" | "test">("NODE_ENV", "development"),
  CORS_ORIGIN: optionalEnv("CORS_ORIGIN", "http://localhost:3001"),
  EXCHANGE_RATE_API_URL: optionalEnv("EXCHANGE_RATE_API_URL", "https://api.exchangerate-api.com/v4/latest"),
  FREE_DAILY_EXPENSE_LIMIT: optionalEnv("FREE_DAILY_EXPENSE_LIMIT", 4),
};
