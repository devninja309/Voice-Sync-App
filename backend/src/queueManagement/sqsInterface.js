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

    var listparams = {};

    //Test functionality
    sqs.listQueues(listparams, function(err, data) {
    if (err) {
        console.log("Error", err);
    } else {

        sqs.getQueueUrl(params, function(err, data) {
            if (err) {
            console.log("Error", err);
            } else {
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
                        console.log("Send Error", err);
                    } else {
                        console.log("Send Success", data.MessageId);
                    }
                    });
            }
        });
        }
    });

    
}
