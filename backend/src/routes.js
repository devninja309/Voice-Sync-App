
import Router from 'koa-router';
import {GetProjects, GetProjectDetails, CreateProject, GetScripts, CreateScript} from './databasestorage/dataaccess.js';
import jwt from 'koa-jwt';
import { addTests } from './routes.test.js';


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

  //TODO Move these into a controller specific to the object when this becomes unmanageable
  .get('/projects', async (ctx) => {
    if (!RequirePermission(ctx,['read:projects'])) {
      //TODO: Handle failure more gracefully, possibly via 'nanner nanner boo boo'
      ctx.body = JSON.stringify([{ID: "0", ProjectName: "No You!"}]);
      return;
    }

    var projectsList = await GetProjects();
    ctx.body = projectsList
    })  
    .get('/projects/:projectID', async (ctx) => {
      if (!RequirePermission(ctx,['read:projects'])) {
        //TODO: Handle failure more gracefully, possibly via 'nanner nanner boo boo'
        console.log('Bad Project Get Permissions')
        ctx.body = JSON.stringify([{ID: "0", ProjectName: "No You!"}]);
        return;
      }
      console.log('Getting Project Details');
      console.log(ctx.params.projectID);
      var project = await GetProjectDetails(ctx.params.projectID);
      ctx.body = project;
      })
    .get('/projects/:projectID/scripts', async (ctx) => {
      if (!RequirePermission(ctx,['read:projects'])) {
        console.log('Bad Project Scripts Get Permissions')
        //TODO: Handle failure more gracefully, possibly via 'nanner nanner boo boo'
        ctx.body = JSON.stringify([{ID: "0", ScriptName: "No You!"}]);
        return;
      }
  
      //console.log('Getting Project Script List');
      //console.log(ctx.params.projectID);
      var scriptsList = await GetScripts(ctx.params.projectID);
      ctx.body = scriptsList
      //console.log(scriptsList);
      })

    .post('/projects', async (ctx) => {
      if (!RequirePermission(ctx,['read:projects'])) {
        //TODO: Handle failure more gracefully, possibly via 'nanner nanner boo boo'
        ctx.body = JSON.stringify([{ID: "0", ProjectName: "No You!"}]);
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

    .post('/scripts', async (ctx) => {
      if (!RequirePermission(ctx,['read:projects'])) {
        //TODO: Handle failure more gracefully, possibly via 'nanner nanner boo boo'
        ctx.body = JSON.stringify([{ID: "0", ProjectName: "No You!"}]);
        console.log('Bad Permissions')
        return;
      }
      let script = ctx.request.body;
      console.log('Request to create script');
      console.log(ctx.request);
      console.log(script)
      if (typeof(script) == "undefined")
      {
        ctx.body = JSON.stringify([{projectID: "Bad", ProjectName: "call"}]);
        return;
      }
      var insertScript = await CreateScript(script);
      ctx.body = insertScript;

    })

    addTests(router);

