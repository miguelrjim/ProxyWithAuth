import * as express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { readFile } from 'fs/promises';
import { exit } from 'process';
import { configureAuthentik } from './providers/authentik';

const app = express();

interface ProxyConfiguration {
  auth: string;
  options: string;
  path: string;
  target: string;
}

interface Configuration {
  proxies: ProxyConfiguration[];
}

async function setup() {
  const configuration: Configuration = JSON.parse(await readFile('/data/options.json', { encoding: 'utf-8' }));
  if ((configuration?.proxies?.length ?? 0) === 0) {
    console.error(`No proxies configured.`);
    exit(1);
  }
  const paths = new Set();
  for (const { path, auth, options, target } of configuration.proxies) {
    if (paths.has(path)) {
      throw `Duplicated path: ${path}`
    }
    const basePath = `/${path}`;
    switch(auth) {
      case "authentik":
        app.use(
          basePath,
          await configureAuthentik(JSON.parse(options))
        );
        app.use(
          basePath,
          createProxyMiddleware({
            target,
            changeOrigin: true,
            pathRewrite: (reqPath, req) => reqPath.substring(basePath.length),
            ws: true
          })
        );
        break;
      default:
        throw `Unknown authentication: ${auth}`;
    }
  }
  app.listen(3000);
  console.log("Finished configuring all proxies, listening on 3000");
}

setup()
  .catch(err => {
    console.error(err);
    exit(1);
  });