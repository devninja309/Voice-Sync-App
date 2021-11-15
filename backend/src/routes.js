
import Router from 'koa-router';
import {GetProjects} from './databasestorage/dataaccess.js';


export const router = new Router()

router.get('/test', (ctx) => {
    ctx.body = 'Hello World'
})

.get('/stuff', (ctx) => {
    ctx.body = 'stuff';
  })

  .get('/projects', async (ctx) => {

    var projectsList = await GetProjects();
    console.log('Returning Projects')
    ctx.body = projectsList
    });

