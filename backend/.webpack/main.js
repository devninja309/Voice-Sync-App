/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

;// CONCATENATED MODULE: external "serverless-http"
const external_serverless_http_namespaceObject = require("serverless-http");
;// CONCATENATED MODULE: external "koa-router"
const external_koa_router_namespaceObject = require("koa-router");
;// CONCATENATED MODULE: external "mysql"
const external_mysql_namespaceObject = require("mysql");
;// CONCATENATED MODULE: ./src/databasestorage/dataaccess.js


//GetListOfProjects
function GetProjects ()
{
    var query = "SELECT * FROM IA_VoiceSynth.Projects";
    try{
    return SQLQuery(query);
    }
    catch (error)
    {
        console.error(error)
    }
    //return "teapot";
    //return ["Project 1", "Project 2", "Project 3"];
}

function CreateProject(project)
{
  //Check Project
  if (!project.projectName){
    //Blow up?
  }
  return new Promise( function (resolve, reject) {

    var con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });

    var insert = 'Insert into IA_VoiceSynth.Projects (ProjectName) Values (?)';
    var values = [project.ProjectName];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      con.end();
      project.ID = results.insertId
      resolve( project);
    });
  });
}

//GetListOfNarrationsByProject
//GetNarrationByID
    //GetClipsByID
//CreateNarration
//CreateClip

function getCon()
{
    return external_mysql_namespaceObject.createConnection({
        host: process.env.SQL_Host,
        user: process.env.SQL_User,
        password: process.env.SQL_PWD,
        database: process.env.SQL_Schema
      });
}

function SQLQuery(query)
{
    return new Promise( function (resolve, reject) {

  var con = getCon();

  con.connect(function(err) {
    if (err) console.log( err);
  });
  
  con.query(query, function (error, results, fields) {
    if (error) throw error;
    con.end();
    resolve( JSON.stringify(results));
  });
   
});
}

;// CONCATENATED MODULE: external "koa-jwt"
const external_koa_jwt_namespaceObject = require("koa-jwt");
;// CONCATENATED MODULE: ./src/voicesynthapi/WellSaidLabs.js
//Specific details for WellSaid

//GetAudioFromWellSaid

async function  getClip  (){
    const ttsResponse = await fetch(ttsEndPoint, {
      signal: abortController.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': process.env.WELLSAID_API_KEY,
      },
      body: JSON.stringify({
        speaker_id: avatarId,
        text,
      }),
    });
}
;// CONCATENATED MODULE: ./src/routes.test.js







//Non-real test endpoints

function addTests(router) {
    router.post('/testAudio', async (ctx) => {
            const abortController = new AbortController();
            const avatarId = ctx.request.avatarId;
            const text = ctx.request.text;
          
            ctx.request.on('aborted', () => {
              // Graceful end of the TTS stream when a client connection is aborted
              abortController.abort()
            })
        console.log('Request to create test audio');
        console.log(ctx.request);
        console.log(text);
        console.log(avatarId);

       
        ctx.response.body = getClip(avatarId, text, abortController);
  
      })
      router.post('/stream', async (ctx) => {
        const abortController = new AbortController();
        const avatarId = ctx.request.body.avatarId;
        const text = ctx.request.body.text;
      
        req.on('aborted', () => {
          // Graceful end of the TTS stream when a client connection is aborted
          abortController.abort()
        })
      
        /**
         * Should this request fail, make sure to check the response headers
         * to try to find a root cause.
         * 
         * Rate-limiting headers:
         * x-quota-limit: 200
         * x-quota-remaining: 191
         * x-quota-reset: 1622226323630
         * x-rate-limit-limit: 5
         * x-rate-limit-remaining: 4
         * x-rate-limit-reset: 1619635874002
         */
        const ttsResponse = await fetch(ttsEndPoint, {
          signal: abortController.signal,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.WELLSAID_API_KEY,
          },
          body: JSON.stringify({
            speaker_id: avatarId,
            text,
          }),
        });
        
        ctx.res.writeHead(ttsResponse.status, ttsResponse.headers.raw());
        ctx.res.flushHeaders();
      
        ttsResponse.body.pipe(ctx.body)
      });


      return router;
}
;// CONCATENATED MODULE: ./src/routes.js







const router = new external_koa_router_namespaceObject()

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
      ctx.body = JSON.stringify([{projectID: "0", ProjectName: "No You!"}]);
      return;
    }

    var projectsList = await GetProjects();
    ctx.body = projectsList
    })

    .post('/projects', async (ctx) => {
      if (!RequirePermission(ctx,['read:projects'])) {
        //TODO: Handle failure more gracefully, possibly via 'nanner nanner boo boo'
        ctx.body = JSON.stringify([{projectID: "0", ProjectName: "No You!"}]);
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

    addTests(router);


;// CONCATENATED MODULE: external "koa"
const external_koa_namespaceObject = require("koa");
;// CONCATENATED MODULE: external "koa-body"
const external_koa_body_namespaceObject = require("koa-body");
;// CONCATENATED MODULE: external "dotenv"
const external_dotenv_namespaceObject = require("dotenv");
;// CONCATENATED MODULE: external "jwks-rsa"
const external_jwks_rsa_namespaceObject = require("jwks-rsa");
;// CONCATENATED MODULE: ./src/security/tokenManager.js
// This is where all the Auth0 Token Management stuff lives, decoders, etc
//TODO move all the config items to the .env file



function GetJWTCheck(ctx){
  const secret = external_jwks_rsa_namespaceObject.koaJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-l3ao-nin.us.auth0.com/.well-known/jwks.json'
})
var jwtCheck = external_koa_jwt_namespaceObject({
    secret: secret,
  //audience: 'VoiceSynthManagerBackend',
  //issuer: 'https://dev-l3ao-nin.us.auth0.com/',
  //algorithms: ['RS256'],
  passthrough: true,
});
return jwtCheck;
}

;// CONCATENATED MODULE: ./src/app.js









var result = external_dotenv_namespaceObject.config();

const app = new external_koa_namespaceObject();
app.use(external_koa_body_namespaceObject());

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

/* harmony default export */ const src_app = (app);
;// CONCATENATED MODULE: ./src/lambda-index.js



const handler = external_serverless_http_namespaceObject(src_app)

// Lambda can't consume ES6 exports
module.exports.handler = async (evt, ctx) => {
  console.log(evt)

  evt.path = evt.path.substr(3)

  const res = await handler(evt, ctx)

  console.log(res)

  return res
}

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;