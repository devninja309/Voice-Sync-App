import mysql, { createConnection } from 'mysql';

//Test functions
export function GetTestInfo()
{
  try {
    let query = "select count(*) as NumCourses FROM IA_VoiceSynth.Courses"; 
    return SQLQuery(query);
  }
  catch (err)
  {
    console.log(err);
    return err.message;
  }
}

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
    errorString += "Invalid Slide Name2\n";
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

export function UpdateSlide(slide, resetAudio = true)
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

export async function GetClipDetails(clipID)
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

export async function UpdateClip(clip, resetAudio = true)
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
//Delete functions
export async function DeleteClip(clipID)
{
  let query = `Delete FROM IA_VoiceSynth.Clips Where Clips.ID = ?`;
  let values = [clipID];
  await SQLQuery(query, values);

  return "success";
}
export async function DeleteSlide(slideID)
{
  let deleteChildren = `Delete From IA_VoiceSynth.Clips where Clips.SlideID = ?`;
  let values = [slideID];
  await SQLQuery(deleteChildren, values);
  
  let query = `Delete FROM IA_VoiceSynth.Slides Where Slides.ID = ?`;
  await SQLQuery(query, values);

  return "success";
}
export async function DeleteChapter(chapterID)
{
  console.log('Deleting Chapter');
  let checkChildren = `Select Count (*) as slidesCount from IA_VoiceSynth.Slides where Slides.ChapterID = ?`
  let values = [chapterID];
  const count = await SQLQuery(checkChildren, values);
  if (count[0].slidesCount > 0)
  {
    return "Cannot Delete, Existing Slides";
  }
  console.log('OK to delete')
  console.log(count);
  console.log(count[0].slidesCount);
  let query = `Delete FROM IA_VoiceSynth.Chapters Where Chapters.ID = ?`;
  await SQLQuery(query, values);
  
  return "success";
}
export async function DeleteCourse(courseID)
{
  let checkChildren = `Select Count (*) as chaptersCount from IA_VoiceSynth.Chapters where Chapters.CourseID = ?`
  let values = [courseID];
  const count = await SQLQuery(checkChildren, values);
  if (count[0].chaptersCount > 0)
  {
    return "Cannot Delete, Existing Chapters";
  }

  let query = `Delete FROM IA_VoiceSynth.Courses Where Courses.ID = ?`;
  await SQLQuery(query, values);
  
  return "success";
}

const LogTypes = {
  Error: 0,
  ClipGenerated: 1,
}

export function LogClipGeneration(User, Text) {
  return CreateLogEntry(LogTypes.ClipGenerated, User, Text);
}
export function LogError(Err) {
  return LogErrorMessage(Err.message)
}
export function LogErrorMessage(Message) {
  return CreateLogEntry(LogTypes.Error, `Unknown`, Message);
}

function CreateLogEntry(LogType, User, Message) {

  return new Promise( function (resolve, reject) {

    let con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });

    let insert = 'Insert into IA_VoiceSynth.LogEntry (ID, User, LogType, Message) Values (UUID_TO_BIN(UUID()),?,?,?)';
    let values = [User, LogType, Message];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      con.end();
      resolve( );
    });
  });
}
export async function GetClipLog(limit, offset, query)
{
    //let today = new Date();
    //defaulting to 1 week.  TODO: Make this whole thing more stepwise
    // let select = 'Select TimeStamp, User, Message from IA_VoiceSynth.LogEntry where LogType = 1 and TimeStamp > ? LIMIT ? OFFSET ?'
    // let values = [new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7), limit, offset]

    let select = 'Select TimeStamp, User, Message from IA_VoiceSynth.LogEntry where LogType = 1 order by TimeStamp desc LIMIT ? OFFSET ?'
    let values = [limit, offset]

    let logs = await SQLQuery(select, values);
     return logs;
}
export async function GetClipLogSize() {

  let select = 'Select Count(*) as quan from IA_VoiceSynth.LogEntry where LogType = 1 ';

  let logs = await SQLQuery(select);
   return logs[0].quan;
}


function getConObj()
{
  return {
    host: process.env.SQL_Host,
    user: process.env.SQL_User,
    password: process.env.SQL_PWD,
    database: process.env.SQL_Schema
  };

}

function getCon()
{
    const conObj = getConObj();
    return mysql.createConnection(conObj);
}

function SQLQuery(query, values)
{
    try {
      return new Promise( function (resolve, reject) {

    let con = getCon();

    con.connect(function(err) {
      if (err) {
        console.log( err);
        resolve(error.message);
      }
    
    
    con.query(query, values, function (error, results, fields) {
      if (error) {
        console.log('Query Error');
        console.log(error)
        resolve(error.message);
      }
      con.end();
      resolve( results);
    });

  });
    
  });
  }
  catch (error)
  {
      console.error(error)
      resolve(error.message);
  }
}
