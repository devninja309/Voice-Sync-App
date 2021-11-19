
import Router from 'koa-router';
import {GetProjects, CreateProject} from './databasestorage/dataaccess.js';
import jwt from 'koa-jwt';


export const router = new Router()

// TODO: This function is dumb and should be replaced with whatever a standard method is
function RequirePermission(ctx,permissions){
  if (!ctx.state )
  {
      console.log('Invalid ctx.state')
      console.log(ctx);
      return false;
  }
  if (!ctx.state.user)
  {
      console.log('Invalid ctx.state.user')
      console.log(ctx.state);
      return false;
  }
  if (!ctx.state.user.permissions)
  {
      console.log('Invalid ctx.state.user.permissions')
      console.log(ctx.state.user);
      return false;
  }
  try{
    if (permissions.every(permission => ctx.state.user.permissions.includes(permission)))
    {
      return true;
    }
  }
  catch (error)
  {
    console.log(error)
    return false;
  }
  console.log('Permission Failure');
  console.log('Want');
  console.log(permissions);
  console.log('Have');
  console.log(ctx.state.user.permissions);
  return false;
}

router.get('/test', (ctx) => {
    ctx.body = 'Hello World'
})

.get('/stuff', (ctx) => {
    ctx.body = 'stuff';
  })

  //TODO Move these into a controller specific to the object when this becomes unmanageable
  .get('/projects', async (ctx) => {
    if (!RequirePermission(ctx,['read:projects'])) {
      //TODO: Handle failure more gracefully, possibly via 'nanner nanner boo boo'
      ctx.body = JSON.stringify([{projectID: "no you!", ProjectName: "No You!"}]);
      return;
    }

    var projectsList = await GetProjects();
    ctx.body = projectsList
    })
    .post('/projects', async (ctx) => {
      if (!RequirePermission(ctx,['read:projects'])) {
        //TODO: Handle failure more gracefully, possibly via 'nanner nanner boo boo'
        ctx.body = JSON.stringify([{projectID: "no you!", ProjectName: "No You!"}]);
        console.log('Bad Permissions')
        return;
      }
      let project = ctx.request.body;
      console.log('Request to create project');
      console.log(ctx.request);
      console.log(project);
      if (typeof(project) == "undefined")
      {
        ctx.body = JSON.stringify([{projectID: "Bad", ProjectName: "call"}]);
        return;
      }
      var insertProject = await CreateProject(project);
      ctx.body = insertProject;

    })

