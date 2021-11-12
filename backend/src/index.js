
import { router } from './routes.js';

import Koa from 'koa';

import env from 'dotenv'
import { GetJWTCheck } from './security/tokenManager.js';

var result = env.config();

const app = new Koa();
//const router = new Router();

const port = 3001

// app.use(async ctx => {
//   ctx.body = 'Hello World';
// });


app
  .use(async (ctx, next) => {
        ctx.set('Access-Control-Allow-Origin', '*')
        ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
        await next();
  })
  .use(router.routes())
  .use(router.allowedMethods())
  .use(GetJWTCheck());

console.log('Listening to ' + port)
app.listen(port);

export default app