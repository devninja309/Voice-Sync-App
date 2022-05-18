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

export function GetPronunciations (pooledConnection)
{
    let query = "SELECT * FROM IA_VoiceSynth.Pronunciations";
    return SQLQuery(query,"", pooledConnection);
}

export async function GetClipDetails(clipID, pooledConnection)
{
  //This is everything except AudioClip, which is binary data.
  //Consider moving AudioClip to a filestore (S3) or a separate table.
  let querySlides = `SELECT ID, SlideID, ClipText, VoiceID, OrdinalValue, Volume,Speed, Delay, Approved, (audioclip is not null) as HasAudio, ClipStatusID
     FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides, pooledConnection);

  let clip = clips[0];
  console.log("Loading Clip:" + clipID)
  return clip;
}

export async function GetClipAudio(clipID, pooledConnection)
{
  let querySlides = `SELECT ID, SlideID, ClipText, VoiceID, OrdinalValue, Volume,Speed, Delay, Approved, AudioClip
     FROM IA_VoiceSynth.Clips as Clips Where Clips.ID = ?`;
  let valuesSlides = [clipID];
  let clips = await SQLQuery(querySlides, valuesSlides, pooledConnection);

  let clip = clips[0];
  return clip;
}
//this function updates the entire clip AND resets the audio to null.
export async function UpdateClip(clip, pooledConnection)
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

  SQLQuery(insert, values, pooledConnection);

}
export async function UpdateClipAudio(clipID, audioBuffer, pooledConnection)
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

  let insert = `Update IA_VoiceSynth.Clips set AudioClip = ? Where ID = ?`;
  let values = [audioBuffer, clipID];
  
  var res = await SQLQuery(insert, values, pooledConnection); //TODO check for DB failure here.

  console.log('Update Audio Clip results:', res)

  return result;

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

  return await SQLQuery(insert, values, pooledConnection);

}
export async function UpdateClipAudioStatus(clipID, newStatus, errorMessage, pooledConnection)
{
  console.log("Start UpdateClipAudioStatus")
  if (!Object.values(e_ClipAudioGenerationStatus).some(val => val == newStatus))
  {
    return console.error("Invalid Status");
  }
  let update = `Update IA_VoiceSynth.Clips set ClipAudioState = ? , ClipAudioStateErrorMessage = ? Where ID = ?`;
  let values = [newStatus, errorMessage ?? "", clipID];
  await SQLQuery(update,values, pooledConnection)

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
      return error.message;
  }
}
