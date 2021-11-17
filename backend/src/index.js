
import { router } from './routes.js';

import Koa from 'koa';
import koaBody from 'koa-body';

import env from 'dotenv'
import { GetJWTCheck } from './security/tokenManager.js';

var result = env.config();

const app = new Koa();
app.use(koaBody());
const port = 3001

app
  .use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', 'http://localhost:3000');
        ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
        await next();
  })
  .use(GetJWTCheck())
  .use(router.routes())
  .use(router.allowedMethods())

console.log('Listening to ' + port)
app.listen(port);

export default app