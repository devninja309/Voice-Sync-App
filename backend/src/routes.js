
import Router from 'koa-router';
import {GetProjects} from './databasestorage/dataaccess.js';


export const router = new Router()

router.get('/test', (ctx) => {
    ctx.body = 'Hello World'
})

.get('/stuff', (ctx) => {
    ctx.body = 'stuff';
  })

  .get('/projects', (ctx) => {
    //ctx.body = Array.prototype.join.call(GetProjects()[1]);
    //ctx.body = GetProjects()[1];
    ctx.body = GetProjects();
    });

