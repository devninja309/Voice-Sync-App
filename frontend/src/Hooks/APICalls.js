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
export function GetCourses(fetchWithAuth)
{
    return fetchWithAuth(getUrlPath('courses'))
    .then(response => response.json());
}
export function GetCourseDetails(fetchWithAuth, CourseID)
{
    return fetchWithAuth(getUrlPath(`courses/${CourseID}`))
    .then(response => response.json());
}
export function GetChapters(fetchWithAuth, CourseID)
{
    return fetchWithAuth(getUrlPath(`courses/${CourseID}/chapters`))
    .then(response => response.json());
}
export function GetChapterDetails(fetchWithAuth, chapterID)
{
    console.log ('GetChapterDetails')
    console.log(chapterID)
    return fetchWithAuth(getUrlPath(`chapters/${chapterID}`))
    .then(response => response.json());
}

export function GetSlides(fetchWithAuth, chapterID)
{
    return fetchWithAuth(getUrlPath(`chapters/${chapterID}/slides`))
    .then(response => response.json());
}

export function GetSlideDetails(fetchWithAuth, slideID)
{
    return fetchWithAuth(getUrlPath(`slides/${slideID}`))
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

export function CreateCourse(fetchWithAuth, course)
{
    return fetchWithAuth(getUrlPath('courses'), PostHeadersForCreate(course))
      .then(response => response.json())
}
export function CreateChapter(fetchWithAuth, chapter)
{
    return fetchWithAuth(getUrlPath('chapters'), PostHeadersForCreate(chapter))
      .then(response => response.json())
}

export function CreateSlide(fetchWithAuth, slide)
{
    return fetchWithAuth(getUrlPath('slides'), PostHeadersForCreate(slide))
      .then(response => response.json())
}
export function CreateClip(fetchWithAuth, clip)
{
    return fetchWithAuth(getUrlPath('clips'), PostHeadersForCreate(clip))
      .then(response => response.json())
}
export function UpdateClipAudio(fetchWithAuth, clipID)
{
    return fetchWithAuth(getUrlPath(`clips/${clipID}/audio`))
    .then(response => response.json());

}
//Put any alternate stuff here

export const UseAPICallsWithAuth = (fetchWithAuth) => {
    return { 
        Createcourse : (course) => CreateCourse(fetchWithAuth, course), 
        GetCourses: () => GetCourses(fetchWithAuth), 
        GetCourseDetails: (CourseID) => GetCourseDetails(fetchWithAuth, CourseID), 
        GetChapters: (CourseID) => GetChapters(fetchWithAuth, CourseID), 
        GetChapterDetails: (chapterID) => GetChapterDetails(fetchWithAuth, chapterID),
        CreateChapter: (chapter) => CreateChapter(fetchWithAuth, chapter),
        GetSlides: (ChapterID) => GetSlides(fetchWithAuth, ChapterID), 
        CreateSlide: (slide) => CreateSlide(fetchWithAuth, slide),
        CreateClip: (clip) => CreateClip(fetchWithAuth, clip),
        UpdateClipAudio: (clipID) => UpdateClipAudio(fetchWithAuth, clipID),
        GetSlideDetails: (slideID) => GetSlideDetails(fetchWithAuth, slideID)}
}