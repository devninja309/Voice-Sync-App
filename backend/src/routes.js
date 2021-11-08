
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
    //ctx.body = Array.prototype.join.call(GetProjects()[1]);
    //ctx.body = GetProjects()[1];
    //ctx.body = GetProjects();

    var projectsList = await GetProjects();
    console.log('returning?')
    console.log(projectsList)
    ctx.body = projectsList
    // .then(results => {
    //   console.log('returning?')
    //   console.log(results)
    //   ctx.body = results
    // });
    });

