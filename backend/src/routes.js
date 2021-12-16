
import Router from 'koa-router';
import {GetCourses, GetCourseDetails, CreateCourse, GetChapters, GetChapterDetails, CreateChapter, GetSlides, CreateSlide, CreateClip, GetSlideDetails} from './databasestorage/dataaccess.js';
import { addTests } from './routes.test.js';


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
      console.log(ctx.params.CourseID);
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
        console.log(ctx.request);
        console.log(course);
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
      console.log(ctx.request);
      console.log(slide)
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
        console.log(ctx.params.slideID);
        let slide = await GetSlideDetails(ctx.params.slideID);
        console.log(slide);
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
      console.log(ctx.request);
      console.log(slide)
      if (typeof(slide) == "undefined")
      {
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      var insertSlide = await CreateSlide(slide);
      ctx.body = JSON.stringify(insertSlide);

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
      console.log(ctx.request);
      console.log(clip)
      if (typeof(clip) == "undefined")
      {
        ctx.body = JSON.stringify([{CourseID: "Bad", courseName: "call"}]);
        return;
      }
      var insertClip = await CreateClip(clip);
      ctx.body = JSON.stringify(insertClip);

    })

    addTests(router);

