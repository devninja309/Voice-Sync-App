export const isLocal = window.location.hostname === 'localhost'

export const getUrlPath = (route) => isLocal ? `http://localhost:3001/${route}` : `/v1/${route}`

//Database

//TODO: Handle 'not logged in' on the front end.
// function getData(path, accessToken) 
// {
//     if (accessToken)
//     {
//     return fetch(getUrlPath(path), {
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//         },
//      })
//            .then(response => response.json())
//     }
//     else
//     {
//         return fetch(getUrlPath(path)) 
//             .then(response => response.json())
//     }
// } 


//Basic Gets
export function GetProjects(fetchWithAuth)
{
    return fetchWithAuth(getUrlPath('projects'))
    .then(response => response.json());
}
export function GetProjectDetails(fetchWithAuth, projectID)
{
    return fetchWithAuth(getUrlPath(`projects/${projectID}`))
    .then(response => response.json());
}

export function GetScripts(fetchWithAuth, projectID)
{
    return fetchWithAuth(getUrlPath(`projects/${projectID}/scripts`))
    .then(response => response.json());
}


//Put all the Create stuff here
const PostHeadersForCreate = (object) => {
    return {
        method: 'post',
        headers: {
            'Content-Type':'application/json', 
            'Accept': 'application/json',},
        body: JSON.stringify(object)
    }
}

export function CreateProject(fetchWithAuth, project)
{
    return fetchWithAuth(getUrlPath('projects'), PostHeadersForCreate(project))
      .then(response => response.json())

}

//Put any alternate stuff here

export const UseAPICallsWithAuth = (fetchWithAuth) => {
    const CreateProjectWithAuth = (project) => CreateProject(fetchWithAuth, project);
    const GetProjectsWithAuth = () => GetProjects(fetchWithAuth);
    const GetProjectDetailsWithAuth = (projectID) => GetProjectDetails(fetchWithAuth, projectID);
    const GetScriptsWithAuth = (projectID) => GetScripts(fetchWithAuth, projectID);


    return { 
        CreateProject : CreateProjectWithAuth, 
        GetProjects: GetProjectsWithAuth, 
        GetProjectDetails: GetProjectDetailsWithAuth, 
        GetScripts: GetScriptsWithAuth}
}