import mysql, { createConnection } from 'mysql';

export class e_ClipAudioGenerationStatus {
  static NoAudio = 1;
  static GeneratingAudio = 2;
  static ErrorGeneratingAudio = 3;
  static HasAudio = 4;

  constructor(value) {
      this.Value = value;
  }
}
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

export function GetPronunciations ()
{
    let query = "SELECT * FROM IA_VoiceSynth.Pronunciations";
    return SQLQuery(query);
}

export async function GetClipDetails(clipID)
{
  //This is everything except AudioClip, which is binary data.
  //Consider moving AudioClip to a filestore (S3) or a separate table.
  let querySlides = `SELECT ID, SlideID, ClipText, VoiceID, OrdinalValue, Volume,Speed, Delay, Approved, (audioclip is not null) as HasAudio, ClipStatusID
     FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides);

  let clip = clips[0];
  console.log("Loading Clip:" + clipID)
  console.log(clip);
  return clip;
}

export async function GetClipAudio(clipID)
{
  let querySlides = `SELECT ID, SlideID, ClipText, VoiceID, OrdinalValue, Volume,Speed, Delay, Approved, AudioClip
     FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides);

  let clip = clips[0];
  return clip;
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
  return new Promise( function (resolve, reject) {

    let con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });


     let insert = `Update IA_VoiceSynth.Clips set VoiceID = ?, OrdinalValue = ?, ClipText = ?, Volume =?, Speed=?, Delay=?, ClipStatusID =?, AudioClip = null Where ID = ?`;
     let values = [clip.VoiceID, clip.OrdinalValue, clip.ClipText, clip.Volume,clip.Speed,clip.Delay, clip.ClipStatusID, clip.ID];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      con.end();
      resolve( clip);
    });
  });
}
export async function UpdateClipAudio(clipID, audioBuffer)
{
  //Check Clip
  var result = {
    Successful: true,
    errorString: "",
  }
  if (!clipID) {
    result.Successful = false;
    result.errorString += "Invalid ClipID\n";
    return result;
  }
  return new Promise( function (resolve, reject) {

    let con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });

     let insert = `Update IA_VoiceSynth.Clips set AudioClip = ? Where ID = ?`;
     let values = [audioBuffer, clipID];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        console.log(err);
        result.errorString = err.message;
        result.Successful = false;
      }
      con.end();
      resolve( result );
    });
  });

}

export async function LogClipGeneration(User, Text) {
  return CreateLogEntry(LogTypes.ClipGenerated, User, Text);
}
export async function LogError(Err) {
  return LogErrorMessage(Err.message)
}
export async function LogErrorMessage(Message) {
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
export async function UpdateClipAudioStatus(clipID, newStatus, errorMessage)
{
  console.log("Start UpdateClipAudioStatus")
  if (!Object.values(e_ClipAudioGenerationStatus).some(val => val == newStatus))
  {
    return console.error("Invalid Status");
  }
  return new Promise( function (resolve, reject) {
    let con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });
    let update = `Update IA_VoiceSynth.Clips set ClipAudioState = ? , ClipAudioStateErrorMessage = ? Where ID = ?`;
    let values = [newStatus, errorMessage ?? "", clipID];
    console.log("Update Query")
    console.log(update);
    console.log(values)

   con.query(update,values, (err, results, fields) => {
     if (err) {
        console.log(err.message);
     }
     con.end();
     console.log("Updating Clip Status " + clipID)
     resolve( );
   });
 });

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
        resolve(err.message);
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
      reject(error.message);
  }
}
