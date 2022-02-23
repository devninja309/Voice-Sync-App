
import {GetClipAudio} from '../databasestorage/dataaccess.js';
//import {lamejs} from 'lamejs';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
import fluent from  'fluent-ffmpeg';

const deployedEnv = process.env.Env || 'dev'
const originalDir = (deployedEnv == 'dev')? './tmp/original' : '/tmp/original';
const processedDir = (deployedEnv == 'dev')? './tmp/processed' : '/tmp/processed';


let files = [];

//padding is in seconds
async function ProcessFile (origFile, procFile, volume, speed, padding) {
    console.log(`Padding= ${padding}`)
    return new Promise((resolve, reject) => {
        const command = fluent(origFile)
            .on('codecData', function(data) {
            console.log('Input is ' + data.audio + ' audio ' +
                'with ' + data.video|| 'no' + ' video');
            })
            .audioCodec('libmp3lame')
            .audioFilters(`volume=${volume}`)
            .audioFilters(`atempo=${speed}`)
            .audioFilters(`apad=pad_dur=${padding}`)
            .output(procFile) 
            .audioCodec('libmp3lame')
            .on('error', function(err, stdout, stderr) {
                console.log(`Cannot process clip :` + err.message);
                try {
                    const arrayOfFiles = fs.readdirSync("/opt")
                    console.log(arrayOfFiles)
                } catch(e) {
                    console.log(e)
                }
                reject();
              })
              .on('end', function(stdout, stderr) {
                console.log(`Transcoding clip succeeded !`);
                resolve();
              })
            .run();
    });
    
}

export async function PreProcessClip(clipID, clipAudio) {
    await SetupTmp(); //TODO this is currently just called at the entry point to every function in this class, but maybe just run on instantiation / code start?
    try {
        console.log('Processing Clip ' + clipID)
        const clipUUID = uuidv4();
        const clipFileName = "".concat(clipID, '-', clipUUID);
        var origFile = `${originalDir}/${clipFileName}.mp3`;
        files.push(origFile);
        var procFile = `${processedDir}/${clipFileName}.mp3`;
        files.push(procFile);
        
        var origBuffer = Buffer.from(clipData.AudioClip);
        await fs.createWriteStream(origFile).write(origBuffer);

        //This method doesn't allow tempo changes greater than *2 /2, but since that's chipmunk range already, it's ok.
        console.log('Starting Clip ' +clip.ID)
        const finished = ProcessFile(origFile, procFile, `5.3dB`, 1.05, 0)
        await finished;
        console.log('Finished Clip ' +clip.ID)
        return procFile;
    }
    finally {
        CleanupTmp();
    }

}

export async function ProcessSlide(slide) {
    await SetupTmp();
    try {
    
        function sortByOrdinalValue(a,b) {
            return a.OrdinalValue - b.OrdinalValue;
        }
        const slideClips = slide.Clips.sort(sortByOrdinalValue);
        const clips = [];
        for(let i = 0; i< slideClips.length;i++){  //This should be synchronous
            const clipFile = await ProcessClip(slideClips[i]);
            clips.push(clipFile);
        }
        console.log(clips);

        const slideUUID = uuidv4();
        const slideFileName = "".concat('output', '-', slideUUID);
        const slideFile = `${processedDir}/${slideFileName}.mp3`;
        files.push(slideFile);

        const command = fluent();
        clips.map(clip => command.input(clip));
        const finished = new Promise((resolve, reject) => {
            command
                .on('error', function(err, stdout, stderr) {
                    console.log('Cannot merge slide ' + err.message);
                    reject();
                })
                .on('end', function(stdout, stderr) {
                    console.log('Transcoding succeeded !');
                    resolve();
                })
                .mergeToFile(slideFile);
            });
        await finished;
        //Load the file back up and return it
        //This isn't a stream, yet, but...
        const mergedSlide = fs.readFileSync(slideFile, function (err, data) {
            if (err) {
              throw err; 
            }
            console.log(data);
          });

        return mergedSlide;

    }
    finally {
        CleanupTmp();
    }
}

async function SetupTmp() {

    if (!fs.existsSync(originalDir)){
        fs.mkdirSync(originalDir, { recursive: true });
    }
    if (!fs.existsSync(processedDir)){
        fs.mkdirSync(processedDir, { recursive: true });
    }
}

async function CleanupTmp() {
    console.log('Cleanup');
    while(files.length > 0) {
        const file = files.pop();
        console.log(file);
        try {
            fs.unlink(file, (err) => {
                if (err) { 
                    console.log('Error Deleting file');
                    //Don't really care
                }
            } );
        }
        catch(err)
        {
            console.log('Error Deleting file');
            //Don't really care
        }
    }
    console.log('Finished Cleanup');

}
async function ProcessClip(clip) {
    console.log('Processing Clip ' + clip.ID)
    const clipUUID = uuidv4();
    const clipFileName = "".concat(clip.ID, '-', clipUUID);
    var origFile = `${originalDir}/${clipFileName}.mp3`;
    files.push(origFile);
    var procFile = `${processedDir}/${clipFileName}.mp3`;
    files.push(procFile);

    const clipData = await GetClipAudio(clip.ID);
    var origBuffer = Buffer.from(clipData.AudioClip);
    await fs.createWriteStream(origFile).write(origBuffer);

    //This method doesn't allow tempo changes greater than *2 /2, but since that's chipmunk range already, it's ok.
    console.log('Starting Clip ' +clip.ID)
    const finished = ProcessFile(origFile, procFile, clip.Volume/200, clip.Speed/100, clip.Delay || .2);
    await finished;
    console.log('Finished Clip ' +clip.ID)
    return procFile;
}