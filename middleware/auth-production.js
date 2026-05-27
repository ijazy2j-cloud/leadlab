// TODO: This middleware requires ./local-modules/config.mjs to export efxEnv and envSettings.
// TODO: This middleware requires @hsbc/hsbc-cert (HSBC internal package, available on DHP).
// TODO: When config.mjs template is received, replace the loginEnv hardcoded value with the import.
// TODO: Switch server.mjs to import this middleware instead of auth.js when deploying to DHP.

// Development note: auth.js (mock, header-based) is used in local dev.
// This file (JWT cookie-based) is used on DHP. Both coexist — do not delete auth.js.

import jwt from 'jsonwebtoken';
import axios from 'axios';
import cookieParser from 'cookie-parser';

// Hardcoded to UAT until config.mjs template is received from IT.
// TODO: replace with: import { efxEnv } from '../local-modules/config.mjs';
const loginEnv = 'uat';

let cachedPublicKey = null;

async function getPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;
  const url = `https://dps.${loginEnv}.digital.mss.hk.hsbc/dps-login/api/public-key`;
  const response = await axios.get(url);
  cachedPublicKey = response.data;
  return cachedPublicKey;
}

async function authProduction(req, res, next) {
  const token = req.cookies['dps-jwt-token'];
  if (!token) {
    return res.status(401).json({
      code: 'AUTH_REQUIRED',
      loginUrl: `https://dps.${loginEnv}.digital.mss.hk.hsbc/dps-login`,
    });
  }

  try {
    const publicKey = await getPublicKey();
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });

    if (payload.department !== 'DIGITAL PRODUCTION SERVICES') {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Department not authorised' });
    }

    const { iat, exp, ...user } = payload;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      code: 'AUTH_REQUIRED',
      loginUrl: `https://dps.${loginEnv}.digital.mss.hk.hsbc/dps-login`,
    });
  }
}

export { authProduction, cookieParser };
