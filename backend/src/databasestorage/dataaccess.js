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

export async function GetClipDetails(clipID)
{
  let promises = [];
  let querySlides = `SELECT * FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides);
  
  return clips[0];
}

export function CreateClip(clip)
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

export function UpdateClip(clip, resetAudio = true)
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

    //Generic Internet code
    // var query = "INSERT INTO files SET ?",
    // values = {
    //     file_type: 'img',
    //     file_size: buffer.length,
    //     file: buffer
    // };

    let insert = 'Update IA_VoiceSynth.Clips set VoiceID = ?, OrdinalValue = ?, ClipText = ?, AudioClip = BINARY(?) Where ID = ?';
    let values = [clip.VoiceID, clip.OrdinalValue, clip.ClipText, audioClip, clip.ClipID];

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
