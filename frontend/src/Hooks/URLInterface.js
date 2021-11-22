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
    fetchWithAuth(getUrlPath('projects'));
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


    return { CreateProject : CreateProjectWithAuth}
}