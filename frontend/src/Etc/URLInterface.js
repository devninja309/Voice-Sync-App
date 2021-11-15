export const isLocal = window.location.hostname === 'localhost'

const projects = ['project 1', 'project 2', 'project 3'];
export const getUrlPath = (route) => isLocal ? `http://localhost:3001/${route}` : `/v1/${route}`

//Database

function getData(path, accessToken) 
{
    if (accessToken)
    {
    return fetch(getUrlPath(path), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
     })
           .then(response => response.json())
    }
    else
    {
        return fetch(getUrlPath(path)) 
            .then(response => response.json())
    }
} 

export function GetProjects(accessToken)
{
    return getData('projects', accessToken);
}