export const isLocal = window.location.hostname === 'localhost'

const projects = ['project 1', 'project 2', 'project 3'];
export const getUrlPath = (route) => isLocal ? `http://localhost:3001/${route}` : `/v1/${route}`

//Database

function getData(path) 
{
    //return projects;
    //console.log(getUrlPath(path));
    return fetch(getUrlPath(path))
           .then(response => response.json())
           //.then(data => console.log(data));
} 

export function GetProjects()
{
    return getData('projects');
}