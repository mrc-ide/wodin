import { processArgs } from "./args";
import { buildWodinStaticSite } from "./builder";

const { configPath, destPath } = processArgs();

buildWodinStaticSite(configPath, destPath);
