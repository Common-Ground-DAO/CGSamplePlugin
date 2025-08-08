import dotenv from "dotenv";
import fs from "fs";

const env: any = {};
dotenv.config({ path: ".env", processEnv: env });

if (fs.existsSync(".env.local")) {
  // Load .env.local file to second env object, as
  // calling dotenv.config() will not override the first env object
  const env2: any = {};
  dotenv.config({ path: ".env.local", processEnv: env2 });
  Object.assign(env, env2);
}

export default env;