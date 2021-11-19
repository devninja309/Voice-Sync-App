export const isLocal = window.location.hostname === 'localhost'

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
export function CreateProject(accessToken, project)
{
    return fetch(getUrlPath('projects'), {
        method: 'post',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type':'application/json', 
            'Accept': 'application/json',},
        body: JSON.stringify(project)
    })
      .then(response => response.json())

}