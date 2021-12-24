
import Router from 'koa-router';
//TODO this is dumb, fix it
import {GetCourses, GetCourseDetails, CreateCourse, GetChapters, GetChapterDetails, CreateChapter, GetSlides, CreateSlide, CreateClip, GetSlideDetails, GetClipDetails, UpdateClip} from './databasestorage/dataaccess.js';
import { addTests } from './routes.test.js';
import fetch from "node-fetch";
import Response from "node-fetch";
import streamToBlob from 'stream-to-blob';

//TODO I should be a parameter
const ttsEndPoint = "https://api.wellsaidlabs.com/v1/tts/stream"


export const router = new Router()

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
        
    //This is just pseudo code for now and needs to be implemented.
    .get('/slides/:slideID/audio/', async (ctx) => {
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

      const ttsResponse = await fetch(ttsEndPoint, {
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

      //Nico, This is the problem.  body is a Stream, but it needs to be a blob
      clip.AudioClip = ttsResponse.body;

      //This library works on the browser, but doesn't work locally.
      //clip.AudioClip = await streamToBlob(ttsResponse.body);

      //https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
      //var response = await Response(ttsResponse.body);
      clip.AudioClip = await ttsResponse.body.blob();



      var updateClip = await UpdateClip(clip, false);
      
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

    //This has not been implemented on the front end, or tested
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

