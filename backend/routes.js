
const Router = require('@koa/router');


export const router = new Router()

router.get('/', (ctx, next) => {
    ctx.body = 'Hello World'
})

.get('/stuff', (ctx, next) => {
    ctx.body = 'stuff';
  });

