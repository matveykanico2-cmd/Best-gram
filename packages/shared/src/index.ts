export const isProduction = process.env.NODE_ENV === 'production';
export const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};
