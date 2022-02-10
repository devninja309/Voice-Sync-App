
import {GetClipAudio} from '../databasestorage/dataaccess.js';
//import {lamejs} from 'lamejs';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
import fluent from  'fluent-ffmpeg';

const originalDir = './tmp/original';
const processedDir = './tmp/processed';


let files = [];

export async function ProcessSlide(slide) {
    await SetupTmp();
    try {

        const clips = [];
        for(let i = 0; i< slide.Clips.length;i++){  //This should be synchronous
            const clipFile = await ProcessClip(slide.Clips[i]);
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
    const finished = new Promise((resolve, reject) => {
        const command = fluent(origFile)
            .on('codecData', function(data) {
            console.log('Input is ' + data.audio + ' audio ' +
                'with ' + data.video + ' video');
            })
            .audioCodec('libmp3lame')
            .audioFilters(`volume=${clip.Volume/100}`)
            .audioFilters(`atempo=${clip.Speed/100}`)
            .output(procFile) 
            .audioCodec('libmp3lame')
            .on('error', function(err, stdout, stderr) {
                console.log(`Cannot process clip ${clip.ID}: ` + err.message);
                reject();
              })
              .on('end', function(stdout, stderr) {
                console.log(`Transcoding clip ${clip.ID} succeeded !`);
                resolve();
              })
            .run();
    });
    await finished;
    console.log('Finished Clip ' +clip.ID)
    return procFile;
}