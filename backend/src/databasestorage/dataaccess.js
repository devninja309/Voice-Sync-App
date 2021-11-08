import mysql from 'mysql';

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
    //return "teapot";
    //return ["Project 1", "Project 2", "Project 3"];
}

//GetListOfNarrationsByProject
//GetNarrationByID
    //GetClipsByID
//CreateProject
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

function SQLQuery(query)
{
    return new Promise( function (resolve, reject) {
  console.log(process.env.SQL_Host);
  console.log(process.env.SQL_User);
  console.log(process.env.SQL_PWD);
  console.log(process.env.SQL_Schema);

  var con = getCon();

  con.connect(function(err) {
    if (err) console.log( err);
    console.log("Connected!");
  });
  
  con.query(query, function (error, results, fields) {
    if (error) throw error;
    console.log('results');
    console.log(results);
    con.end();
    resolve( JSON.stringify(results));
  });
   
});
}
