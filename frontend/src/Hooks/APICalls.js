
export const isLocal = window.location.hostname === 'localhost'

export const getUrlPath = (route) => isLocal ? `http://localhost:3001/v1/${route}` : `/v1/${route}`
//export const getUrlPath = (route) => isLocal ? `http://localhost:3001/${route}` : `https://d333dqbzp50nvv.cloudfront.net/${route}`
//export const getUrlPath = (route) => isLocal ? `http://localhost:3001/${route}` : `https://ffo9tmh1jh.execute-api.us-west-2.amazonaws.com/Prod/${route}`

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

//Tests
export function DBTestCall(fetchWithAuth)
{
    return fetchWithAuth(getUrlPath('dbtest'))
        .then(response => response.json());
}

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
export function GetPronunciations(fetchWithAuth)
{
    return fetchWithAuth(getUrlPath('pronunciations'))
    .then(response => response.json());
}
const GetHeadersForMP3 = (object) => {
    return {
        method: 'get',
        headers: {
            'Content-Type':'application/json', 
            'Accept': 'audio/mpeg'},
        }      
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
const PostHeadersForMP3 = (object) => {
    return {
        method: 'post',
        headers: {
            'Content-Type':'application/json', 
            'Accept': 'audio/mpeg'},
        body: JSON.stringify(object)
    }
}
const PutHeadersForUpdate = (object) => {
    return {
        method: 'put',
        headers: {
            'Content-Type':'application/json', 
            'Accept': 'application/json',},
        body: JSON.stringify(object)
    }
}
const DeleteHeadersForDelete = (object) => {
    return {
        method: 'DELETE',
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
export function CreatePronunciation(fetchWithAuth, pronunciation)
{
    return fetchWithAuth(getUrlPath('pronunciations'), PostHeadersForCreate(pronunciation))
      .then(response => response.json())
}
export function UpdateSlide(fetchWithAuth, slide)
{
    const strippedSlide = {...slide, Clips:[]};
    return fetchWithAuth(getUrlPath(`slides/${strippedSlide.ID}`), PutHeadersForUpdate(strippedSlide))
      .then(response => response.json())
}
export function UpdateClip(fetchWithAuth, clip)
{
    clip.ClipAudio = null;
    return fetchWithAuth(getUrlPath(`clips/${clip.ID}`), PutHeadersForUpdate(clip))
      .then(response => response.json())
}
export function UpdateClipOrder(fetchWithAuth, clips)
{
    console.log('In UpdateClipOrder');
    clips.forEach(clip => clip.ClipAudio = null);
    return fetchWithAuth(getUrlPath(`clips_reorder`), PutHeadersForUpdate(clips))
      .then(response => response.json())
}
export function UpdatePostClip(fetchWithAuth, clip)
{
    clip.ClipAudio = null;
    return fetchWithAuth(getUrlPath(`clipsPost/${clip.ID}`), PutHeadersForUpdate(clip))
      .then(response => response.json())
}

export function UpdateClipAudio(fetchWithAuth, clipID)
{
    return fetchWithAuth(getUrlPath(`clips/${clipID}/generateaudio`))
    .then(response => response.json());

}
export function UpdatePronunciation(fetchWithAuth, pronunciation)
{
    return fetchWithAuth(getUrlPath(`pronunciations/${pronunciation.ID}`), PutHeadersForUpdate(pronunciation))
      .then(response => response.json())
}
export function GetSlideAudio(fetchWithAuth, slideID)
{
    return fetchWithAuth(getUrlPath(`slides/${slideID}/audio`), GetHeadersForMP3())
    .then(response => response); 

}
export function GenerateSlideAudio(fetchWithAuth, slideID)
{
    return fetchWithAuth(getUrlPath(`slides/${slideID}/generateaudio`))
    .then(response => response); 

}
export function DownloadSlideAudio(fetchWithAuth, slideID)
{
    return fetchWithAuth(getUrlPath(`slides/${slideID}/downloadaudio`), GetHeadersForMP3())
    .then(response => response); 

}
export function GetClipAudio(fetchWithAuth, clipID)
{
    return fetchWithAuth(getUrlPath(`clips/${clipID}/audio`), GetHeadersForMP3())
    .then(response => response); 

}
export function GetPronunciationAudio(fetchWithAuth, text)
{
    return fetchWithAuth(getUrlPath(`pronunciations/check`), PostHeadersForMP3({
        "Pronunciation": text}))
    .then(response => response); 

}
export function DeleteClip(fetchWithAuth, clipID)
{
    return fetchWithAuth(getUrlPath(`clips/${clipID}`), DeleteHeadersForDelete())
    .then(response => response.json()); 

}
export function DeleteSlide(fetchWithAuth, slideID)
{
    return fetchWithAuth(getUrlPath(`slides/${slideID}`), DeleteHeadersForDelete())
    .then(response => response.json()); 

}
export function DeleteChapter(fetchWithAuth, chapterID)
{
    return fetchWithAuth(getUrlPath(`chapters/${chapterID}`), DeleteHeadersForDelete())
    .then(response => response.json());

}
export function DeleteCourse(fetchWithAuth, courseID)
{
    return fetchWithAuth(getUrlPath(`courses/${courseID}`), DeleteHeadersForDelete())
    .then(response => response.json()); 

}
export function DeletePronunciation(fetchWithAuth, pronunciationID)
{
    return fetchWithAuth(getUrlPath(`pronunciations/${pronunciationID}`), DeleteHeadersForDelete())
    .then(response => response.json()); 

}
export function GetEventLogs(fetchWithAuth, page, query)
{
    return fetchWithAuth(getUrlPath(`logs/${page}`), PostHeadersForCreate(query))
        .then(response => response.json())
}

export function GetEventLogSize(fetchWithAuth) 
{
    return fetchWithAuth(getUrlPath(`logs/info`))
        .then(response => response.json());
}
//Put any alternate stuff here

export const UseAPICallsWithAuth = (fetchWithAuth) => {
    return { 
        DBTestCall : () => DBTestCall(fetchWithAuth),
        Createcourse : (course) => CreateCourse(fetchWithAuth, course), 
        GetCourses: () => GetCourses(fetchWithAuth), 
        GetCourseDetails: (CourseID) => GetCourseDetails(fetchWithAuth, CourseID), 
        GetChapters: (CourseID) => GetChapters(fetchWithAuth, CourseID), 
        GetChapterDetails: (chapterID) => GetChapterDetails(fetchWithAuth, chapterID),
        CreateChapter: (chapter) => CreateChapter(fetchWithAuth, chapter),
        GetSlides: (ChapterID) => GetSlides(fetchWithAuth, ChapterID), 
        CreateSlide: (slide) => CreateSlide(fetchWithAuth, slide),
        UpdateSlide: (slide) => UpdateSlide(fetchWithAuth, slide),
        CreateClip: (clip) => CreateClip(fetchWithAuth, clip),
        UpdateClip: (clip) => UpdateClip(fetchWithAuth, clip),
        UpdateClipOrder: (clips) => UpdateClipOrder(fetchWithAuth, clips),
        UpdatePostClip: (clip) => UpdatePostClip(fetchWithAuth, clip),
        UpdateClipAudio: (clipID) => UpdateClipAudio(fetchWithAuth, clipID),
        GetSlideAudio: (slideID) => GetSlideAudio(fetchWithAuth, slideID), 
        GenerateSlideAudio: (slideID) => GenerateSlideAudio(fetchWithAuth, slideID), 
        DownloadSlideAudio: (slideID) => DownloadSlideAudio(fetchWithAuth, slideID), 
        GetClipAudio: (clipID) => GetClipAudio(fetchWithAuth, clipID),
        GetSlideDetails: (slideID) => GetSlideDetails(fetchWithAuth, slideID),
        DeleteClip: (clipID) => DeleteClip(fetchWithAuth, clipID), 
        DeleteSlide: (slideID) => DeleteSlide(fetchWithAuth, slideID), 
        DeleteChapter: (chapterID) => DeleteChapter(fetchWithAuth, chapterID), 
        DeleteCourse: (courseID) => DeleteCourse(fetchWithAuth, courseID), 
        GetEventLogs: (page) => GetEventLogs(fetchWithAuth, page),
        GetEventLogSize: () => GetEventLogSize(fetchWithAuth),
        GetPronunciations: () => GetPronunciations(fetchWithAuth),
        DeletePronunciation: (pronunciationID) => DeletePronunciation(fetchWithAuth, pronunciationID),
        GetPronunciationAudio: (text) => GetPronunciationAudio(fetchWithAuth, text),
        CreatePronunciation: (pronunciation) => CreatePronunciation(fetchWithAuth, pronunciation),
        UpdatePronunciation: (pronunciation) => UpdatePronunciation(fetchWithAuth, pronunciation)
    }
}
