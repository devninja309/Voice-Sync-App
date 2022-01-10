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


//GetListOfcourses
function GetCourses ()
{
    let query = "SELECT * FROM IA_VoiceSynth.Courses";
    return SQLQuery(query);
}
function GetCourseDetails(courseID)
{
  let query = "SELECT * FROM IA_VoiceSynth.Courses Where ID = ?";
  let values = [courseID];
  
  return SQLQuery(query, values);
}

function GetChapters(courseID)
{
    let query = `SELECT Chapters.*, Count(Slides.ID) as SlideCount FROM IA_VoiceSynth.Chapters 
              left join IA_VoiceSynth.Slides 
              on Chapters.ID = Slides.ChapterID 
              Where CourseID = ?
              group by Chapters.ID `;
    let values = [courseID];
    try{
    return SQLQuery(query, values)
    }
    catch (error)
    {
        console.error(error)
    }
}
async function GetChapterDetails(chapterID)
{
  let query = "SELECT * FROM IA_VoiceSynth.Chapters Where ID = ?";
  let values = [chapterID];
  
  return SQLQuery(query, values);
}

function GetSlides(chapterID)
{
    let query = `SELECT Slides.* , Chapters.CourseID as CourseID FROM IA_VoiceSynth.Slides 
                  Left Join Chapters on Chapters.ID = Slides.ChapterID Where ChapterID = ?`;
    let values = [chapterID];
    try{
    return SQLQuery(query, values)
    }
    catch (error)
    {
        console.error(error)
    }
}
async function GetSlideDetails(slideID)
{
  let promises = [];
  let querySlides = `SELECT * FROM IA_VoiceSynth.Slides as Slides Where Slides.ID = ?`;
  let valuesSlides = [slideID];
  let slides = await SQLQuery(querySlides, valuesSlides);
  
  slides.forEach(slide => {
    
      let queryClips = `Select * from Clips where Clips.SlideID = ?`;

      promises.push(SQLQuery(queryClips, valuesSlides).then(clips => {
        slide.Clips = clips
      }));
  })
  await Promise.all(promises);
  return slides;
}

function CreateCourse(course)
{
  //Check course
  if (!course.CourseName){
    //Blow up?
  }
  return new Promise( function (resolve, reject) {

    let con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });

    let insert = 'Insert into IA_VoiceSynth.Courses (CourseName) Values (?)';
    let values = [course.CourseName];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      con.end();
      course.ID = results.insertId
      resolve( course);
    });
  });
}
function CreateChapter(chapter)
{
  //Check chapter
  if (!chapter.ChapterName){
    //Blow up?
  }
  if (!chapter.CourseID){
    error = true;
    errorString += "Invalid ChapterID\n";
  }
  return new Promise( function (resolve, reject) {

    let con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });

    let insert = 'Insert into IA_VoiceSynth.Chapters (ChapterName, CourseID) Values (?,?)';
    let values = [chapter.ChapterName, chapter.CourseID];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      con.end();
      chapter.ID = results.insertId
      resolve( chapter);
    });
  });
}

function CreateSlide(slide)
{
  //Check Slide
  let error = false;
  let errorString = "";
  if (!slide.SlideName){
    error = true;
    errorString += "Invalid Slide Name\n";
  }
  if (!slide.ChapterID){
    error = true;
    errorString += "Invalid ChapterID\n";
  }
  if (!slide.VoiceID) {
    error = true;
    errorString += "Invalid VoiceID\n";
  }
  return new Promise( function (resolve, reject) {

    let con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });

    let insert = 'Insert into IA_VoiceSynth.Slides (SlideName,SlideText, VoiceID, ChapterID) Values (?,?,?,?)';
    let values = [slide.SlideName, slide.SlideText,slide.VoiceID, slide.ChapterID];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      con.end();
      slide.ID = results.insertId
      resolve( slide);
    });
  });
}

function UpdateSlide(slide, resetAudio = true)
{
  //Check Clip
  let error = false;
  let errorString = "";
  if (!slide.SlideName){
    error = true;
    errorString += "Invalid Slide Name\n";
  }
  if (!slide.ChapterID){
    error = true;
    errorString += "Invalid ChapterID\n";
  }
  if (!slide.VoiceID) {
    error = true;
    errorString += "Invalid VoiceID\n";
  }
  return new Promise( function (resolve, reject) {

    let con = getCon();

    let voiceID = slide.VoiceID || 3

    con.connect(function(err) {
      if (err) console.log( err);
    });

      console.log('Updating Slide');
      console.log (slide)
     let update = 'Update  IA_VoiceSynth.Slides set SlideName = ?,SlideText = ?, VoiceID = ?, ChapterID = ? Where ID = ?';
     let values = [slide.SlideName, slide.SlideText,slide.VoiceID, slide.ChapterID, slide.ID];
 
     con.query(update,values, (err, results, fields) => {
       if (err) {
         return console.error(err.message);
       }
       con.end();
       resolve(slide);
     });
    });
}

async function GetClipDetails(clipID)
{
  let promises = [];
  let querySlides = `SELECT * FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides);

  let clip = clips[0];
  if (clip.AudioClip !== null)
  {
    //const buffer =  Buffer.from(clip.AudioClip, "binary");
    //clip.AudioClip = buffer;
  }
  return clip;
}

function CreateClip(clip)
{
  //Check Clip
  let error = false;
  let errorString = "";
  if (!clip.SlideID){
    error = true;
    errorString += "Invalid SlideID\n";
  }
  if (!clip.VoiceID) {
    error = true;
    errorString += "Invalid VoiceID\n";
  }
  return new Promise( function (resolve, reject) {

    let con = getCon();

    let voiceID = clip.VoiceID || 3

    con.connect(function(err) {
      if (err) console.log( err);
    });

    let insert = 'Insert into IA_VoiceSynth.Clips (SlideID,ClipText, VoiceID, OrdinalValue) Values (?,?,?,?)';
    let values = [clip.SlideID, clip.ClipText, voiceID,clip.OrdinalValue];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      con.end();
      clip.ID = results.insertId
      resolve( clip);
    });
  });
}

function UpdateClip(clip, resetAudio = true)
{
  //Check Clip
  let error = false;
  let errorString = "";
  if (!clip.SlideID){
    error = true;
    errorString += "Invalid SlideID\n";
  }
  if (!clip.VoiceID) {
    error = true;
    errorString += "Invalid VoiceID\n";
  }
  if (!clip.ClipID) {
    error = true;
    errorString += "Invalid ClipID\n";
  }
  return new Promise( function (resolve, reject) {

    let con = getCon();

    let voiceID = clip.VoiceID || 3

    con.connect(function(err) {
      if (err) console.log( err);
    });

    const audioClip = resetAudio ? null : clip.AudioClip

     let insert = `Update IA_VoiceSynth.Clips set VoiceID = ?, OrdinalValue = ?, ClipText = ?, AudioClip = ? Where ID = ?`;
     let values = [clip.VoiceID, clip.OrdinalValue, clip.ClipText, audioClip, clip.ID];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      con.end();
      resolve( clip);
    });
  });
}

function getCon()
{
    return external_mysql_namespaceObject.createConnection({
        host: process.env.SQL_Host,
        user: process.env.SQL_User,
        password: process.env.SQL_PWD,
        database: process.env.SQL_Schema
      });
}

function SQLQuery(query, values)
{
    try {
      return new Promise( function (resolve, reject) {

    let con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });
    
    con.query(query, values, function (error, results, fields) {
      if (error) throw error;
      con.end();
      resolve( results);
    });
    
  });
  }
  catch (error)
  {
      console.error(error)
  }
}

;// CONCATENATED MODULE: external "koa-jwt"
const external_koa_jwt_namespaceObject = require("koa-jwt");
;// CONCATENATED MODULE: external "node-fetch"
const external_node_fetch_namespaceObject = require("node-fetch");
;// CONCATENATED MODULE: ./src/voicesynthapi/WellSaidLabs.js
//Specific details for WellSaid


//GetAudioFromWellSaid

async function  getClip  (){
    const ttsResponse = await external_node_fetch_namespaceObject(ttsEndPoint, {
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








const routes_test_ttsEndPoint = "https://api.wellsaidlabs.com/v1/tts/stream"
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
      
        // ctx.req.on('close', () => {
        //   // Graceful end of the TTS stream when a client connection is aborted
        //   abortController.abort()
        // })
      
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
        const ttsResponse = await external_node_fetch_namespaceObject(routes_test_ttsEndPoint, {
          //signal: abortController.signal,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.WELLSAID_API_KEY,
          },
          body: JSON.stringify({
            speaker_id: avatarId,
            text: text,
          }),
        });
        
        ctx.res.writeHead(ttsResponse.status, ttsResponse.headers.raw());
        ctx.res.flushHeaders();

        console.log('tts Response');
        console.log(ttsResponse);

        ctx.body = ttsResponse.body;
      
      });


      return router;
}
;// CONCATENATED MODULE: external "stream-to-blob"
const external_stream_to_blob_namespaceObject = require("stream-to-blob");
;// CONCATENATED MODULE: external "node:buffer"
const external_node_buffer_namespaceObject = require("node:buffer");
;// CONCATENATED MODULE: ./src/routes.js


//TODO this is dumb, fix it







//TODO I should be a parameter
const routes_ttsEndPoint = "https://api.wellsaidlabs.com/v1/tts/stream"


const router = new external_koa_router_namespaceObject()

// TODO: This function is dumb and should be replaced with whatever a standard method is
function RequirePermission(ctx,permissions){
  if (!ctx.state )
  {
      console.log('Invalid ctx.state')
      return false;
  }
  if (!ctx.state.user)
  {
      console.log('Invalid ctx.state.user')
      return false;
  }
  if (!ctx.state.user.permissions)
  {
      console.log('Invalid ctx.state.user.permissions')
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
  /*************************************
   * 
   *  COURSES
   * 
   *************************************/
  .get('/courses', async (ctx) => {
    if (!RequirePermission(ctx,['read:courses'])) {
      //TODO: Handle failure more gracefully
      ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
      return;
    }

    let coursesList = await GetCourses();
    ctx.body = JSON.stringify(coursesList);
    })  


    .get('/courses/:CourseID', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        //TODO: Handle failure more gracefully
        console.log('Bad course Get Permissions')
        ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
        return;
      }
      console.log('Getting course Details');
      let course = await GetCourseDetails(ctx.params.CourseID);
      ctx.body = JSON.stringify(course);
      })


      .post('/courses', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          //TODO: Handle failure more gracefully
          ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
          console.log('Bad Permissions')
          return;
        }
        let course = ctx.request.body;
        console.log('Request to create course');
        if (typeof(course) == "undefined")
        {
          ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
          return;
        }
        var insertcourse = await CreateCourse(course);
        ctx.body = JSON.stringify(insertcourse);
  
      })

      /*************************************
       * 
       * CHAPTERS
       * 
       *************************************/

      .get('/courses/:CourseID/chapters', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          console.log('Bad course Slides Get Permissions')
          //TODO: Handle failure more gracefully
          ctx.body = JSON.stringify([{ID: "0", SlideName: "No You!"}]);
          return;
        }
        let chaptersList = await GetChapters(ctx.params.CourseID);
        ctx.body = JSON.stringify(chaptersList)
        })

        .get('/chapters/:chapterID', async (ctx) => {
          if (!RequirePermission(ctx,['read:courses'])) {
            //TODO: Handle failure more gracefully
            console.log('Bad Chapter Get Permissions')
            ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
            return;
          }
          console.log('Getting Chapter Details');
          console.log(ctx.params.chapterID);
          let chapter = await GetChapterDetails(ctx.params.chapterID);
          console.log(chapter);
          ctx.body = JSON.stringify(chapter);
          })
  

        .post('/chapters', async (ctx) => {
          if (!RequirePermission(ctx,['read:courses'])) {
            //TODO: Handle failure more gracefully
            ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
            console.log('Bad Permissions')
            return;
          }
          let chapter = ctx.request.body;
          console.log('Request to create chapter');
          console.log(ctx.request);
          console.log(chapter)
          if (typeof(chapter) == "undefined")
          {
            ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
            return;
          }
          var insertChapter = await CreateChapter(chapter);
          ctx.body = JSON.stringify(insertChapter);
    
        })

      /*************************************
       * 
       * SLIDES
       * 
       *************************************/
      .get('/chapters/:chapterID/slides', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          console.log('Bad course Slides Get Permissions')
          //TODO: Handle failure more gracefully
          ctx.body = JSON.stringify([{ID: "0", SlideName: "No You!"}]);
          return;
        }
        let slidesList = await GetSlides(ctx.params.chapterID);
        ctx.body = JSON.stringify(slidesList)
        })

    .post('/slides', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        //TODO: Handle failure more gracefully
        ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
        console.log('Bad Permissions')
        return;
      }
      let slide = ctx.request.body;
      console.log('Request to create slide');
      if (typeof(slide) == "undefined")
      {
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      var insertSlide = await CreateSlide(slide);
      ctx.body = JSON.stringify(insertSlide);

    })


      .get('/slides/:slideID', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          //TODO: Handle failure more gracefully
          console.log('Bad Slide Get Permissions')
          ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
          return;
        }
        console.log('Getting Slide Details');
        let slide = await GetSlideDetails(ctx.params.slideID);
        ctx.body = JSON.stringify(slide);
        })

      .post('/slides', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          //TODO: Handle failure more gracefully
          ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
          console.log('Bad Permissions')
          return;
        }
        let slide = ctx.request.body;
        console.log('Request to create slide');
        if (typeof(slide) == "undefined")
        {
          ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
          return;
        }
        var insertSlide = await CreateSlide(slide);
        ctx.body = JSON.stringify(insertSlide);
  
      })
      .put('/slides/:slideID', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          //TODO: Handle failure more gracefully
          ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
          console.log('Bad Permissions')
          return;
        }
        let slide = ctx.request.body;
        console.log('Request to update slide');
        if (typeof(slide) == "undefined")
        {
          ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
          return;
        }
        var updateSlide = await UpdateSlide(slide);
        ctx.body = JSON.stringify(updateSlide);
  
      })
      .put('/slides/:slideID', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          //TODO: Handle failure more gracefully
          ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
          console.log('Bad Permissions')
          return;
        }
        let slide = ctx.request.body;
        console.log('Request to update clip');
        if (typeof(clip) == "undefined")
        {
          ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
          return;
        }
        var updateSlide = await UpdateSlide(slide);
        ctx.body = JSON.stringify(updateSlide);
  
      })
        
    //This is just pseudo code for now and needs to be implemented.
    .get('/slides/:slideID/generateaudio/', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        //TODO: Handle failure more gracefully
        console.log('Bad Slide Get Permissions')
        ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
        return;
      }
      console.log('Request to merge clip audio files');
      //Check each clip to ensure there is audio, else error
      //Load all audio clips
      //Merge all audio clips with parameters (part of slide?  do we need another input?)  This includes 'white space' between clips and speed up factor
      //Save audio file to slide
      //return audio file (or the full slide?)
      ctx.body = JSON.stringify(slide);
      })

    .get('/clips/:clipID/audio', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        //TODO: Handle failure more gracefully
        console.log('Bad Clip Audio Generate Get Permissions')
        ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
        return;
      }
      console.log('Getting Audio')
      let clip = await GetClipDetails(ctx.params.clipID);

      ctx.body = clip.AudioClip;
    })


    .get('/clips/:clipID/generateaudio', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        //TODO: Handle failure more gracefully
        console.log('Bad Clip Audio Generate Get Permissions')
        ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
        return;
      }
      console.log('Updating Clip Audio file')

      console.log('-Getting Clip Details');
      let clip = await GetClipDetails(ctx.params.clipID);


      const abortController = new AbortController();
      const avatarId = clip.VoiceID;
      const text = clip.ClipText;
    
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

      const ttsResponse = await external_node_fetch_namespaceObject(routes_ttsEndPoint, {
        //signal: abortController.signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.WELLSAID_API_KEY,
        },
        body: JSON.stringify({
          speaker_id: avatarId,
          text: text,
        }),
      });

      let status = ttsResponse.status;
      //TODO handle invalid responses here
      if (status != 200)
      {
        console.log('tts Response Status was invalid');
        console.log(ttsResponse.status);
      }

      //https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
      const responseBlob = await ttsResponse.blob()
      const responseArray = await responseBlob.arrayBuffer();
      const buffer = await Buffer.from(responseArray);
      clip.AudioClip = buffer;

      console.log('-Updating Clip based on audio file');
      var updateClip = await UpdateClip(clip, false);
      console.log('-Finished updating clip');

      
      ctx.body = JSON.stringify(updateClip);
      })

    .post('/clips', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        //TODO: Handle failure more gracefully
        ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
        console.log('Bad Permissions')
        return;
      }
      let clip = ctx.request.body;
      console.log('Request to create clip');
      if (typeof(clip) == "undefined")
      {
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      var insertClip = await CreateClip(clip);
      ctx.body = JSON.stringify(insertClip);

    })

    .put('/clips/:clipID', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        //TODO: Handle failure more gracefully
        ctx.body = JSON.stringify([{ID: "0", courseName: "No You!"}]);
        console.log('Bad Permissions')
        return;
      }
      let clip = ctx.request.body;
      console.log('Request to update clip');
      if (typeof(clip) == "undefined")
      {
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      var updateClip = await UpdateClip(clip);
      ctx.body = JSON.stringify(updateClip);

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










const deployedEnv = process.env.Env || 'dev'

var result = external_dotenv_namespaceObject.config({ path: '.env.' + deployedEnv });

//TODO check result and fail gracefully

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