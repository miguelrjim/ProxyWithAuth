import axios from 'axios';
import { RequestHandler } from 'express';

interface AuthentikOptions {
  url: string;
  clientId: string;
  username: string;
  password: string;
}

interface AuthInfo {
  token: string;
  expires: number;
}

let authInfo: AuthInfo | undefined;

async function fetchToken(options: AuthentikOptions) {
  if (!authInfo || Date.now() > authInfo.expires) {
    const { data, status } = await axios.postForm(
      options.url,
      {
        grant_type: 'client_credentials',
        client_id: options.clientId,
        username: options.username,
        password: options.password
      }
    )
    if (status != 200) {
      throw `Failed to retrieve token from authentik\n${data}`;
    }
    authInfo = {
      token: data.access_token,
      expires: Date.now() + (data.expires_in * 1000)
    }
  }
  return authInfo;
}

export async function configureAuthentik(options: AuthentikOptions): Promise<RequestHandler> {
  if ([options.url, options.clientId, options.username, options.password].find(v => !v) !== undefined) {
    throw('url, clientId, username & password have to be specified for authentik');
  }
  await fetchToken(options);
  return async (req, res, next) => {
    const { token } = await fetchToken(options);
    req.headers["authorization"] = `Bearer ${token}`;
    next();
  }
}