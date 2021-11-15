
import { router } from './routes.js';

import Koa from 'koa';
import cors from '@koa/cors';
import jwt from 'koa-jwt';
import jwks from 'jwks-rsa';

import env from 'dotenv'
import { GetJWTCheck } from './security/tokenManager.js';

var result = env.config();

const app = new Koa();
//const router = new Router();

const port = 3001

// app.use(async ctx => {
//   ctx.body = 'Hello World';
// });
const jwtCheck = jwt({
  secret: jwks.koaJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: 'https://dev-l3ao-nin.us.auth0.com/.well-known/jwks.json'
}),
//audience: 'VoiceSynthManagerBackend',
//issuer: 'https://dev-l3ao-nin.us.auth0.com/',
//algorithms: ['RS256'],
//passthrough: true,
});


app
  //.use(cors)
  .use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    //ctx.set('Access-Control-Allow-Origin', '*');
        //ctx.set('Access-Control-Allow-Credentials', 'true');
        ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
        await next();
  })
  .use(router.routes())
  .use(router.allowedMethods())
  //.use(GetJWTCheck());
  //.use(jwtCheck);

console.log('Listening to ' + port)
app.listen(port);

export default app