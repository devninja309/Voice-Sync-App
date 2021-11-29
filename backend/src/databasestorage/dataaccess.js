import mysql, { createConnection } from 'mysql';

//GetListOfProjects
export function GetProjects ()
{
    var query = "SELECT * FROM IA_VoiceSynth.Projects";
    try{
    return SQLQuery(query);
    }
    catch (error)
    {
        console.error(error)
    }
}
export function GetProjectDetails(projectID)
{
  var query = "SELECT * FROM IA_VoiceSynth.Projects Where ID = ?";
  var values = [projectID];
  try{
  return SQLQuery(query, values);
  }
  catch (error)
  {
      console.error(error)
  }

}

export function GetScripts(projectID)
{
    var query = "SELECT * FROM IA_VoiceSynth.Scripts Where ProjectID = ?";
    var values = [projectID];
    try{
    return SQLQuery(query, values);
    }
    catch (error)
    {
        console.error(error)
    }
}

export function CreateProject(project)
{
  //Check Project
  if (!project.projectName){
    //Blow up?
  }
  return new Promise( function (resolve, reject) {

    var con = getCon();

    con.connect(function(err) {
      if (err) console.log( err);
    });

    var insert = 'Insert into IA_VoiceSynth.Projects (ProjectName) Values (?)';
    var values = [project.ProjectName];

    con.query(insert,values, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      con.end();
      project.ID = results.insertId
      resolve( project);
    });
  });
}

//GetListOfNarrationsByProject
//GetNarrationByID
    //GetClipsByID
//CreateNarration
//CreateClip

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
    return new Promise( function (resolve, reject) {

  var con = getCon();

  con.connect(function(err) {
    if (err) console.log( err);
  });
  
  con.query(query, values, function (error, results, fields) {
    if (error) throw error;
    con.end();
    resolve( JSON.stringify(results));
  });
   
});
}
