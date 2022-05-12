
import Router from 'koa-router';
//TODO this is dumb, fix it
import {GetCourses, GetCourseDetails, CreateCourse, GetChapters, GetChapterDetails, GetSlides,
  CreateChapter, CreateSlide, CreateClip, GetSlideDetails, GetClipDetails, GetClipAudio,
  UpdateClip, UpdateClipPost, UpdateSlide, UpdateClipAudio, UpdateClipOrder, UpdateClipAudioStatus,
  GetSlideAudio, SetSlideAudio,
  DeleteClip, DeleteSlide, DeleteChapter, DeleteCourse, 
  GetPronunciations, CreatePronunciation, UpdatePronunciation, DeletePronunciation,
  LogClipGeneration, GetClipLog, GetClipLogSize} from './databasestorage/dataaccess.js';
//import {audioProcessTest} from './audioManipulation/audioProcess'
import {GetTestInfo} from './databasestorage/dataaccess.js';
import { addTests } from './routes.test.js';
import fetch from "node-fetch";
import Response from "node-fetch";
import { ConvertPronunciationFast } from './voicesynthapi/Pronunciation.js';
import {ProcessSlide} from './audioManipulation/audioProcess.js';
import { e_ClipAudioGenerationStatus, RequestClipAudioGeneration } from './queueManagement/sqsInterface.js';

//TODO I should be a parameter
const ttsEndPoint = "https://api.wellsaidlabs.com/v1/tts/stream"
const auth0EndPoint = "https://dev-l3ao-nin.us.auth0.com/.well-known/jwks.json"
const auth0NameSpace = "https://industryacademy.com/"
const defaultPageSize = 20;
const deployedEnv = process.env.Env || 'dev'

export const router = new Router({
  prefix: '/v1'
})

// TODO: This function is dumb and should be replaced with whatever a standard method is
function RequirePermission(ctx,permissions){
  return true;
  if (!ctx.state )
  {
    ctx.status = 401;
      return false;
  }
  if (!ctx.state.user)
  {
      ctx.status = 401;
      return false;
  }
  if (!ctx.state.user.permissions)
  {
    ctx.status = 403;
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
    ctx.status = 403;
    return false;
  }
  ctx.status = 403;
  return false;
}
function GetUserName(ctx) {
  const user = ctx.state.user
  const email = user[auth0NameSpace +'email']
  return email;

}

router.get('/test', (ctx) => {
  ctx.body = 'Hello World Updated orig 3'
})
.get('/v1/test', (ctx) => {
    ctx.body = 'Hello World Updated test'
})
.get('/audiotest', async(ctx) => {
  console.log('AudioTest 1');
  const testSlideID = 81; //Hardcoded to Two Sentence Slide for testing.
  //Load slide
    let slide = await GetSlideDetails(81);

  //Process slide
  console.log('AudioTest 2');
    const audioFile = await ProcessSlide(slide);

  //return slide
  console.log('AudioTest 3');
    ctx.isBase64Encoded = true; 
    ctx.body = audioFile;  
    ctx.set('Content-Type', 'audio/mpeg');
    ctx.set('Content-Disposition', 'attachment; filename=clip.mp3')
    //Amazon encoding code
    //ctx.body =  Buffer.from(clip.AudioClip).toString('base64');

})
.get('/dbtest', async (ctx) => {

  let getKey = async () => {
    var result = await fetch(auth0EndPoint, {
      method: 'GET',
    });
    return result;
  }

  try {
    var key = await getKey();
    console.log('printingKey');
    console.log(key);
    let test = await GetTestInfo();
    console.log('Con Test End');
    ctx.body = JSON.stringify(test);
  }
  catch (err)
  {
    //ctx.body = err.message;
    ctx.body = 'There was a problem'
    ctx.status = 200;
  }
})
.get('/whoami', async (ctx) => {
    const userName = GetUserName(ctx);
    console.log('WhoAmI');
    console.log(email);
    ctx.body = email;

})
  //TODO Move these into a controller specific to the object when this becomes unmanageable
  /*************************************
   * 
   *  COURSES
   * 
   *************************************/
  .get('/courses', async (ctx) => {
    if (!RequirePermission(ctx,['read:courses'])) {
      return;
    }

    let coursesList = await GetCourses();
    ctx.body = JSON.stringify(coursesList);
    })  


    .get('/courses/:CourseID', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      let course = await GetCourseDetails(ctx.params.CourseID);
      ctx.body = JSON.stringify(course[0]);
      })


      .post('/courses', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          return;
        }
        let course = ctx.request.body;
        if (typeof(course) == "undefined")
        {
          ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
          return;
        }
        var insertcourse = await CreateCourse(course);
        ctx.body = JSON.stringify(insertcourse);
  
      })
      .del('/courses/:courseID', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          return;
        }
        var result = await DeleteCourse(ctx.params.courseID);
        ctx.body = JSON.stringify(result);
  
      })

      /*************************************
       * 
       * CHAPTERS
       * 
       *************************************/

      .get('/courses/:CourseID/chapters', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          return;
        }
        let chaptersList = await GetChapters(ctx.params.CourseID);
        ctx.body = JSON.stringify(chaptersList)
        })

        .get('/chapters/:chapterID', async (ctx) => {
          if (!RequirePermission(ctx,['read:courses'])) {
            return;
          }
          let chapter = await GetChapterDetails(ctx.params.chapterID);
          ctx.body = JSON.stringify(chapter[0]);
          })
  

        .post('/chapters', async (ctx) => {
          if (!RequirePermission(ctx,['read:courses'])) {
            return;
          }
          let chapter = ctx.request.body;
          if (typeof(chapter) == "undefined")
          {
            ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
            return;
          }
          var insertChapter = await CreateChapter(chapter);
          ctx.body = JSON.stringify(insertChapter);
    
        })
        .del('/chapters/:chapterID', async (ctx) => {
          if (!RequirePermission(ctx,['read:courses'])) {
            return;
          }
          var result = await DeleteChapter(ctx.params.chapterID);
          ctx.body = JSON.stringify(result);
    
        })

      /*************************************
       * 
       * SLIDES
       * 
       *************************************/
      .get('/chapters/:chapterID/slides', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          return;
        }
        let slidesList = await GetSlides(ctx.params.chapterID);
        ctx.body = JSON.stringify(slidesList)
        })

    .post('/slides', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      let slide = ctx.request.body;
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
          return;
        }
        let slide = await GetSlideDetails(ctx.params.slideID);
        ctx.body = JSON.stringify(slide);
        })

      .post('/slides', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          return;
        }
        let slide = ctx.request.body;
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
          return;
        }
        let slide = ctx.request.body;
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
          return;
        }
        let slide = ctx.request.body;
        if (typeof(clip) == "undefined")
        {
          ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
          return;
        }
        var updateSlide = await UpdateSlide(slide);
        ctx.body = JSON.stringify(updateSlide);
  
      })
        
    .get('/slides/:slideID/generateaudio', async (ctx) => {
      //Load slide
        let slide = await GetSlideDetails(ctx.params.slideID);
    
      //Process slide=
        const audioFile = await ProcessSlide(slide);
    
      //Save slide
        await SetSlideAudio(ctx.params.slideID, audioFile);
        ctx.body = 'ok';
      })
      .get('/slides/:slideID/downloadaudio', async (ctx) => {
        const slideID = ctx.params.slideID
        //Load slide
          let slideAudio = await GetSlideAudio(slideID);
      
          if (slideAudio != null) { //Don't really return anything if the slide audio is null
        //return slide
          ctx.isBase64Encoded = true; 
          ctx.body = slideAudio.AudioFile;  
          //ctx.set('Content-Type', 'audio/mpeg');
          ctx.set('Content-Type', 'application/octet-stream');
          ctx.set('Content-Disposition', `attachment; filename=slide-${slideID}.mp3`)
          }
        })
      .get('/slides/:slideID/audio', async (ctx) => {
          //Load slide
          let slideAudio = await GetSlideAudio(ctx.params.slideID);
          
          //return slide
            ctx.isBase64Encoded = true; 
            ctx.body = slideAudio.AudioFile;  
            ctx.set('Content-Type', 'audio/mpeg');
          })
      .del('/slides/:slideID', async (ctx) => {
        if (!RequirePermission(ctx,['read:courses'])) {
          return;
        }
        var result = await DeleteSlide(ctx.params.slideID);
        ctx.body = JSON.stringify(result);
  
      })

      /*************************************
       * 
       * CLIPS
       * 
       *************************************/

    .get('/clips/:clipID/audio', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        //return;
      }
      let clip = await GetClipAudio(ctx.params.clipID);

      //'body': base64.b64encode(image).decode('utf-8'),
      ctx.isBase64Encoded = true;   

      //Amazon encoding code
      ctx.body = clip.AudioClip;
      //ctx.body =  Buffer.from(clip.AudioClip).toString('base64');
      ctx.set('Content-Type', 'audio/mpeg');
      //ctx.set('Content-Disposition', 'attachment; filename=clip.mp3')

    })
    .get('/clips/:clipID', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      let clip = await GetClipDetails(ctx.params.clipID);
      ctx.body = JSON.stringify(clip);
    })


    .get('/clips/:clipID/generateaudio', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      //Step 1:  Check if running local
      if (deployedEnv != 'dev' || true){
        //Update process status
          let clip = await GetClipDetails(ctx.params.clipID);

          const rawText = clip.ClipText;

          const pronunciations  = await GetPronunciations();

          const text = ConvertPronunciationFast(pronunciations, rawText);
          await LogClipGeneration(GetUserName(ctx), text);
          //TODO This process doesn't really delete the old audio file.  This means it's still available until the new one comes back.
          //It should actually be seen on the front end, though, because the status indicates that there's no audio.  How do we feel about this?
          UpdateClipAudioStatus(clip.ID, e_ClipAudioGenerationStatus.GeneratingAudio);
          RequestClipAudioGeneration(clip.ID);
          clip.ClipAudioState = e_ClipAudioGenerationStatus.GeneratingAudio;
          clip.HasAudio = 0;
          ctx.body = JSON.stringify(clip);
      }
      else {
        //On run this locally
        try {
          let clip = await GetClipDetails(ctx.params.clipID);

          const avatarId = clip.VoiceID;
          const rawText = clip.ClipText;

          const pronunciations  = await GetPronunciations();

          const text = ConvertPronunciationFast(pronunciations, rawText);

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
            console.log('Failed to get audio file');
            console.log('tts Response Status was invalid');
            console.log(ttsResponse.status);
            ctx.status = 500;
            console.log(ttsResponse);
          }
          else {
            //console.log('Successful audio generation');
            //console.log(ttsResponse.headers);
          }

          //https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
          const responseBlob = await ttsResponse.blob()
          const responseArray = await responseBlob.arrayBuffer();
          const buffer = await Buffer.from(responseArray);
          clip.AudioClip = buffer;

          await LogClipGeneration(GetUserName(ctx), text);

          await UpdateClipAudio(ctx.params.clipID, buffer);
          clip.HasAudio = 1;
          ctx.body = JSON.stringify(clip);
        }
        catch (exp) {
          console.log('Error Generating Clip')
          console.log(exp);
        }
        }
      }
    )

    .post('/clips', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      let clip = ctx.request.body;
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
        return;
      }
      let clip = ctx.request.body;
      if (typeof(clip) == "undefined")
      {
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      var updateClip = await UpdateClip(clip);
      ctx.body = JSON.stringify(updateClip);

    })

    .put('/clipsPost/:clipID', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      let clip = ctx.request.body;
      if (typeof(clip) == "undefined")
      {
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      var updateClip = await UpdateClipPost(clip);
      ctx.body = JSON.stringify(updateClip);

    })

    .put('/clips_reorder', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      let clips = ctx.request.body;
      if (typeof(clips) == "undefined")
      {
        console.log ('Undefined Data')
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      await UpdateClipOrder(clips);
      ctx.body = JSON.stringify('Success');

    })
    .del('/clips/:clipID', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      var result = await DeleteClip(ctx.params.clipID);
      ctx.body = JSON.stringify(result);

    })


      /*************************************
       * 
       * LOGS
       * 
       *************************************/

    .post('/logs/:offset', async (ctx) => {

      if (!RequirePermission(ctx, ['read:logs'])) {
        return;
      }
      let query = ctx.request.body;
      var result = await GetClipLog(defaultPageSize, parseInt(ctx.params.offset,10) * defaultPageSize, query);
      ctx.body = JSON.stringify(result);
    })
    .get('/logs/info', async (ctx) => {

      if (!RequirePermission(ctx, ['read:logs'])) {
        return;
      }
      var result = await GetClipLogSize();
      ctx.body = {
        Records: result,
        Limit: defaultPageSize
      }
    })


/*************************************
* 
* PRONUNCIATIONS
* 
*************************************/
    .get('/pronunciations', async (ctx) => {
    if (!RequirePermission(ctx,['read:courses'])) {
      return;
    }

    let pronunciationList = await GetPronunciations();
    ctx.body = JSON.stringify(pronunciationList);
    }) 

    .post('/pronunciations/check' , async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      const pronunciation = ctx.request.body;
      const avatarId = 3;
      const text = pronunciation.Pronunciation;
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

      //https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
      const responseBlob = await ttsResponse.blob()
      const responseArray = await responseBlob.arrayBuffer();
      const buffer = await Buffer.from(responseArray);

      ctx.isBase64Encoded = true;   

      ctx.body = buffer;

      await LogClipGeneration(GetUserName(ctx), text);
      
      ctx.set('Content-Type', 'audio/mpeg');
    })

    .post('/pronunciations', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      let pronunciation = ctx.request.body;
      if (typeof(pronunciation) == "undefined")
      {
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      var insertpronunciation = await CreatePronunciation(pronunciation);
      ctx.body = JSON.stringify(insertpronunciation);
    })

    .put('/pronunciations/:pronunciationID', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      let pronunciation = ctx.request.body;
      
      if (typeof(pronunciation) == "undefined")
      {
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      var updatePronunciation = await UpdatePronunciation(pronunciation);
      ctx.body = JSON.stringify(updatePronunciation);
    })

    .del('/pronunciations/:pronunciationID', async (ctx) => {
      if (!RequirePermission(ctx,['read:courses'])) {
        return;
      }
      var result = await DeletePronunciation(ctx.params.pronunciationID);
      ctx.body = JSON.stringify(result);

    })

      /*************************************
       * 
       * External routes
       * 
       *************************************/

    addTests(router);

