import mysql, { createConnection } from 'mysql';
import { e_ClipAudioGenerationStatus } from '../queueManagement/sqsInterface.js';

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
    let query = `SELECT Slides.* , Chapters.CourseID as CourseID, (SlideAudio.SlideID is not null) as HasAudio  FROM IA_VoiceSynth.Slides 
                  Left Join Chapters on Chapters.ID = Slides.ChapterID 
                  Left Join SlideAudio on Slides.ID = SlideAudio.SlideID
                  Where ChapterID = ?`;
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
    
      let queryClips = `Select ID, SlideID, ClipText, VoiceID, OrdinalValue, Volume,Speed, Delay, Approved, ClipStatusID, (audioclip is not null) as HasAudio,
      ClipAudioState, ClipAudioStateErrorMessage
      from Clips where Clips.SlideID = ?`;

      promises.push(SQLQuery(queryClips, valuesSlides).then(clips => {
        slide.Clips = clips
      }));
  })

  let queryAudio = `select Count(*) as AudioCount from SlideAudio where SlideAudio.SlideID = ?`;
  promises.push (SQLQuery(queryAudio, valuesSlides).then(count => {
    slides[0].HasAudio = count[0].AudioCount > 0
  }));

  await Promise.all(promises);
  return slides[0];
}
export function GetPronunciations (pooledConnection)
{
    let query = "SELECT * FROM IA_VoiceSynth.Pronunciations";
    return SQLQuery(query, "", pooledConnection);
}

export async function CreateCourse(course)
{
  //Check course
  if (!course.CourseName){    
    //Blow up?
  }
  let insert = 'Insert into IA_VoiceSynth.Courses (CourseName) Values (?)';
  let values = [course.CourseName];
  const results = await SQLQuery(insert, values);
  console.log('Create Results');
  console.log(results);
  course.ID = results.insertId
  return course;
}
export async function CreateChapter(chapter)
{
  //Check chapter
  if (!chapter.ChapterName){
    //Blow up?
  }
  if (!chapter.CourseID){
    error = true;
    errorString += "Invalid ChapterID\n";
  }

  let insert = 'Insert into IA_VoiceSynth.Chapters (ChapterName, CourseID) Values (?,?)';
  let values = [chapter.ChapterName, chapter.CourseID];
  const results = await SQLQuery(insert,values);
    
  chapter.ID = results.insertId
  return chapter;
}

export async function CreateSlide(slide)
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

  let insert = 'Insert into IA_VoiceSynth.Slides (SlideName,SlideText, VoiceID, ChapterID, OrdinalValue) Values (?,?,?,?,?)';
  let values = [slide.SlideName, slide.SlideText,slide.VoiceID, slide.ChapterID, slide.OrdinalValue];

  const results = await SQLQuery(insert, values);
  slide.ID = results.insertId
  return slide;
}
export async function CreatePronunciation(pronunciation)
{
  //Check pronunciation
  if (!pronunciation.Word){
    //Blow up?
  }
  if (!pronunciation.Pronunciation){
    //Blow up?
  }

  let insert = 'Insert into IA_VoiceSynth.Pronunciations (Word, Pronunciation) Values (?,?)';
  let values = [pronunciation.Word, pronunciation.Pronunciation];
  const results = await SQLQuery(insert, values);
  pronunciation.ID = results.insertId
  return pronunciation;
}

export async function UpdateSlide(slide, resetAudio = true)
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
  let voiceID = slide.VoiceID || 3

  let update = 'Update  IA_VoiceSynth.Slides set SlideName = ?,SlideText = ?, VoiceID = ?, ChapterID = ?, OrdinalValue = ? Where ID = ?';
  let values = [slide.SlideName, slide.SlideText,slide.VoiceID, slide.ChapterID, slide.OrdinalValue, slide.ID];
  await SQLQuery(update, values)
  return slide;
}

export async function GetClipDetails(clipID, pooledConnection)
{
  //This is everything except AudioClip, which is binary data.
  //Consider moving AudioClip to a filestore (S3) or a separate table.
  let querySlides = `SELECT ID, SlideID, ClipText, VoiceID, OrdinalValue, Volume,Speed, Delay, Approved, (audioclip is not null) as HasAudio, 
     ClipStatusID, ClipAudioState, ClipAudioStateErrorMessage
     FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides, pooledConnection);

  let clip = clips[0];
  return clip;
}

export async function GetClipAudio(clipID)
{
  let querySlides = `SELECT ID, SlideID, ClipText, VoiceID, OrdinalValue, Volume,Speed, Delay, Approved, AudioClip, ClipAudioState, ClipAudioStateErrorMessage
     FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides);

  let clip = clips[0];
  return clip;
}
export async function CreateClip(clip)
{
  //Check Clip
  let error = false;
  let errorString = "";
  if (!clip.SlideID || clip.SlideID == null){
    error = true;
    errorString += "Invalid SlideID\n";
  }
  if (!clip.VoiceID|| clip.VoiceID == null) {
    error = true;
    errorString += "Invalid VoiceID\n";
  }
  let voiceID = clip.VoiceID || 3

  let insert = 'Insert into IA_VoiceSynth.Clips (SlideID,ClipText, VoiceID, OrdinalValue, ClipStatusID) Values (?,?,?,?,1)';
  let values = [clip.SlideID, clip.ClipText, voiceID,clip.OrdinalValue];
  var results = await SQLQuery(insert, values);
  clip.ID = results.insertId
  return clip;
}
export async function UpdateClipAudioStatus(clipID, newStatus, errorMessage, pooledConnection)
{
  if (!Object.values(e_ClipAudioGenerationStatus).some(val => val == newStatus))
  {
    return console.error("Invalid Status");
  }

  let update = `Update IA_VoiceSynth.Clips set ClipAudioState = ? , ClipAudioStateErrorMessage = ? Where ID = ?`;
  let values = [newStatus, "Updated via API", clipID];

  var result = await SQLQuery(update,values, pooledConnection);
  console.log("Updated Audio State", result);
}

//this function updates the entire clip AND resets the audio to null.
export async function UpdateClip(clip)
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

  let insert = `Update IA_VoiceSynth.Clips set VoiceID = ?, OrdinalValue = ?, ClipText = ?, Volume =?, Speed=?, Delay=?, ClipStatusID =?, AudioClip = null Where ID = ?`;
  let values = [clip.VoiceID, clip.OrdinalValue, clip.ClipText, clip.Volume,clip.Speed,clip.Delay, clip.ClipStatusID, clip.ID];

  await SQLQuery(insert, values);

  return clip;
}
export async function GetSlideAudio(slideID) {
  let querySlides = `SELECT SlideID, AudioFile
     FROM IA_VoiceSynth.SlideAudio as SlideAudio Where SlideAudio.SlideID = ?`;
  let valuesSlides = [slideID];
  let audios = await SQLQuery(querySlides, valuesSlides);

  let audio = audios[0];
  return audio;

}
export async function SetSlideAudio(slideID, audioBuffer) {

  //Check Slide
  let error = false;
  let errorString = "";
  if (!slideID) {
    error = true;
    errorString += "Invalid SlideID\n";
  }
  await DeleteSlideAudio(slideID); 

  let insert = `Insert into IA_VoiceSynth.SlideAudio (SlideID, AudioFile) values (?,?)`;
  let values = [slideID, audioBuffer];

  return SQLQuery(insert, values);

}
export async function UpdateClipAudio(clipID, audioBuffer)
{
  //Check Clip
  let error = false;
  let errorString = "";
  if (!clipID) {
    error = true;
    errorString += "Invalid ClipID\n";
  }
  let insert = `Update IA_VoiceSynth.Clips set AudioClip = ? Where ID = ?`;
  let values = [audioBuffer, clipID];
  return SQLQuery(insert,values);

}

//This function only updates items that do not require the audio to be regenerated
export async function UpdateClipPost(clip)
{
  //Check Clip
  let error = false;
  let errorString = "";
  if (!clip.ID) {
    error = true;
    errorString += "Invalid ClipID\n";
  }

    let update = `Update IA_VoiceSynth.Clips set Volume = ?, Speed = ?, Delay = ?, ClipStatusID = ? Where ID = ?`;
    let values = [clip.Volume, clip.Speed, clip.Delay, clip.ClipStatusID, clip.ID];

    await SQLQuery(update,values);
    return clip;

}
export async function UpdateClipOrder(clips) {

  //Check Clip
  let error = false;
  let errorString = "Error Updating Clip Order\n";
  if (!clips.every(clip => clip.ID)) {
    error = true;
    errorString += "Invalid ClipID\n";
    console.log(errorString);
  }
  const promises = [];
  let con = getCon();

  con.connect(function(err) {
    if (err) console.log( err);
  });

  const update = `Update IA_VoiceSynth.Clips set OrdinalValue =? Where ID = ?`;
  con.beginTransaction(function (err) {
    if (err) {
      throw err;
    }  

  clips.forEach(clip => {
      const values = [clip.OrdinalValue, clip.ID];
      promises.push (SQLQuery(update, values));
    })
  });

  //TODO This is messier than it should be.
  await Promise.all(promises).then (

    function(result){con.commit(function(err) {
      if (err) { 
        con.rollback(function() {
          console.log('Error updating clip order');
          console.log(err);
          throw err;
        })}})},
    function(rejected){
      con.rollback(function() {
        console.log('Rejection updating clip order');
        console.log(rejected);
        throw(rejected);
      })
    }
    )
  con.end();
  return;
}

export async function UpdatePronunciation(pronunciation)
{
  //Check Clip
  let error = false;
  let errorString = "";
  //Check pronunciation
  if (!pronunciation.ID){
    error = true;
    errorString += "Invalid ID\n";
  }
  if (!pronunciation.Word){
    error = true;
    errorString += "Invalid Word\n";
  }
  if (!pronunciation.Pronunciation){
    error = true;
    errorString += "Invalid Pronunciation\n";
  }

  let insert = `Update IA_VoiceSynth.Pronunciations set Word = ?, Pronunciation = ? Where ID = ?`;
  let values = [pronunciation.Word, pronunciation.Pronunciation,  pronunciation.ID];

  return SQLQuery(insert,values);
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
  let checkChildren = `Select Count (*) as slidesCount from IA_VoiceSynth.Slides where Slides.ChapterID = ?`
  let values = [chapterID];
  const count = await SQLQuery(checkChildren, values);
  if (count[0].slidesCount > 0)
  {
    return "Cannot Delete, Existing Slides";
  }
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
export async function DeletePronunciation(pronunciationID)
{
  let query = `Delete FROM IA_VoiceSynth.Pronunciations Where Pronunciations.ID = ?`;
  let values = [pronunciationID];
  await SQLQuery(query, values);

  return "success";
}

export async function DeleteSlideAudio(slideID)
{
  let query = `Delete FROM IA_VoiceSynth.SlideAudio Where SlideAudio.SlideID = ?`;
  let values = [slideID];
  await SQLQuery(query, values);

  return "success";
}

const LogTypes = {
  Error: 0,
  ClipGenerated: 1,
}

export async function LogClipGeneration(User, Text, pooledConnection) {
  return CreateLogEntry(LogTypes.ClipGenerated, User, Text, pooledConnection);
}
export async function LogError(Err) {
  return LogErrorMessage(Err.message)
}
export async function LogErrorMessage(Message) {
  return CreateLogEntry(LogTypes.Error, `Unknown`, Message);
}

async function CreateLogEntry(LogType, User, Message, pooledConnection) {

    let insert = 'Insert into IA_VoiceSynth.LogEntry (ID, User, LogType, Message) Values (UUID_TO_BIN(UUID()),?,?,?)';
    let values = [User, LogType, Message];

    await SQLQuery(insert, values, pooledConnection);
}

export async function GetClipLog(limit, offset, query)
{
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
//Create a pooled connection that can be used multiple times.
export function getPooledConnection()
{
  return new Promise( function (resolve, reject) {
    const con = getCon();

    con.connect(function(err) {
      if (err) {
        console.log( err);
        resolve(err.message);
      }
      resolve(con);
    });
  });
}
export function resolvePooledConnection(con)
{
  con.destroy();
}

async function SQLQuery(query, values, pooledConnection)
{
    try {
      return new Promise( async function (resolve, reject) {

        const con = pooledConnection ?? await getPooledConnection()

        con.query(query, values, function (error, results, fields) {
          if (error) {
            console.log('Query Error');
            console.log(error)
            if (pooledConnection == null) {
              con.destroy();
            }
            resolve(error.message);
          }
          if (pooledConnection == null) {
            con.destroy();
          }
          resolve( results);
        });
      });
  }
  catch (error)
  {
      console.error(error)
      reject(error.message);
  }
}
