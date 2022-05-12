
import GenerateClipAudioFile from './audiohandler.js'
import {UpdateClipAudioStatus, e_ClipAudioGenerationStatus} from './databasestorage/dataaccess.js'

// Lambda can't consume ES6 exports
exports.handler = async (evt, ctx) => {

  await Promise.all(evt.Records.map(async (record) => {
    console.log(record);
    const clipId = parseInt(record.messageAttributes.ClipId.stringValue)
    //const clipId = 1;
    var result = await GenerateClipAudioFile(clipId);
    const newStatus = result.status==200 ? e_ClipAudioGenerationStatus.HasAudio : e_ClipAudioGenerationStatus.ErrorGeneratingAudio;
    console.log("Clip Generation Status")
    console.log(result)
    console.log(newStatus)
    await UpdateClipAudioStatus(clipId, newStatus, result.message);
    console.log("Done Generating Audio");

  }));


  return {};
}


// {
//   "Records": [
//       {
//           "messageId": "059f36b4-87a3-44ab-83d2-661975830a7d",
//           "receiptHandle": "AQEBwJnKyrHigUMZj6rYigCgxlaS3SLy0a...",
//           "body": "test",
//           "attributes": {
//               "ApproximateReceiveCount": "1",
//               "SentTimestamp": "1545082649183",
//               "SenderId": "AIDAIENQZJOLO23YVJ4VO",
//               "ApproximateFirstReceiveTimestamp": "1545082649185"
//           },
//           "messageAttributes": {},
//           "md5OfBody": "098f6bcd4621d373cade4e832627b4f6",
//           "eventSource": "aws:sqs",
//           "eventSourceARN": "arn:aws:sqs:us-east-2:123456789012:my-queue",
//           "awsRegion": "us-east-2"
//       }
//   ]
// }
