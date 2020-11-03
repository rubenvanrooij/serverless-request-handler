export const PROVIDER = process.env.PROVIDER;
export const TRACING_ENABLED = process.env.TRACING_ENABLED === 'true' && process.env.IS_OFFLINE !== 'true';
