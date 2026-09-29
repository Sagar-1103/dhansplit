import dotenv from "dotenv";
dotenv.config();

function requiredEnv(key: string) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable [${key}] not defined`);
    }
    return value;
}

function optionalEnv<T>(key: string, defaultValue: T) {
    const value = process.env[key];
    return value ?? defaultValue;
}

export const env = {
    PORT: Number(optionalEnv("PORT","3000")),
    CORS_ORIGIN: requiredEnv("CORS_ORIGIN"),
};

