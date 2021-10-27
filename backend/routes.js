
const Router = require('@koa/router');
const Data = require('./databasestorage/dataaccess');


export const router = new Router()

router.get('/', (ctx, next) => {
    ctx.body = 'Hello World'
})

.get('/stuff', (ctx, next) => {
    ctx.body = 'stuff';
  })

  .get('/projects', (ctx, next) => {
      ctx.body = Data.GetProjects();
    });

