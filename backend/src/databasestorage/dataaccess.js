import mysql, { createConnection } from 'mysql';

//GetListOfcourses
export function GetCourses ()
{
    let query = "SELECT * FROM IA_VoiceSynth.Courses";
    return SQLQuery(query);
}
export function GetCourseDetails(courseID)
{
  let query = "SELECT * FROM IA_VoiceSynth.Courses Where ID = ?";
  let values = [courseID];
  
  return SQLQuery(query, values);
}

export function GetChapters(courseID)
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
export async function GetChapterDetails(chapterID)
{
  let query = "SELECT * FROM IA_VoiceSynth.Chapters Where ID = ?";
  let values = [chapterID];
  
  return SQLQuery(query, values);
}

export function GetSlides(chapterID)
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
export async function GetSlideDetails(slideID)
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

export function CreateCourse(course)
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
export function CreateChapter(chapter)
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

export function CreateSlide(slide)
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
  return new Promise( function (resolve, reject) {

    let con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });

    let insert = 'Insert into IA_VoiceSynth.Slides (SlideName,SlideText, ChapterID) Values (?,?,?)';
    let values = [slide.SlideName, slide.SlideText, slide.ChapterID];

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

function getCon()
{
    return mysql.createConnection({
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
