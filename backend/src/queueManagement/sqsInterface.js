import AWS from 'aws-sdk';

AWS.config.update({region:'us-west-2'}); //TODO: Make configurable

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var params = {
  QueueName: 'WellSaidSQSQueue' //This comes from the queue creation YAML
};

export class e_ClipAudioGenerationStatus {
    static NoAudio = 1;
    static GeneratingAudio = 2;
    static ErrorGeneratingAudio = 3;
    static HasAudio = 4;

    constructor(value) {
        this.Value = value;
    }
}


export async function RequestClipAudioGeneration(clipId) {
    console.log('RequestClipAudioGeneration Start')
    var listparams = {};
    var sqsPromise = new Promise((resolve, reject) => {
        //Test functionality
        sqs.listQueues(listparams, function(err, data) {
        if (err) {
            console.log("Error Loading SQS Queue Names");
            console.log("Error", err);
            reject("Error Loading SQS Queue Names")
        } else {
            console.log('Got SQS List');
            sqs.getQueueUrl(params, function(err, data) {
                if (err) {
                    console.log("Error Loading SQS Queue");
                    console.log("Error", err);
                    reject("Error Loading SQS Queue")
                } else {
                    console.log('Got Specific Queue')
                    var params = {
                        DelaySeconds: 0,
                        MessageAttributes: {
                            "ClipId": {
                            DataType: "Number",
                            StringValue: clipId.toString()
                            }
                        },
                        MessageBody: "Request for audio generation by clipId",
                        QueueUrl: data.QueueUrl
                        };
                    sqs.sendMessage(params, function(err, data) {
                        if (err) {
                            console.log("Error submitting to SQS queue Message:", data.MessageID, "\nClipId: ", clipId.toString())
                            console.log("Send Error", err);
                            reject("Error submitting to SQS queue Message:", data.MessageID, "\nClipId: ", clipId.toString());
                        } else {
                            //console.log("Send Success", data.MessageId);
                            console.log("Submitting Message:", data.MessageId, "\nTimeStamp:", Date.now())
                            resolve();
                        }
                        });
                    console.log('tried to send message to SQS');
                }
            });
            }
        })
    });
    await sqsPromise;   
    return sqsPromise;
}
