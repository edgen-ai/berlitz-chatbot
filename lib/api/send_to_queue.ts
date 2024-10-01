import AWS from "aws-sdk";

const kinesis = new AWS.Kinesis({ region: "us-west-1" });

function sendToQueue(connectionId: string, text: string, queue: string) {
    const data = { Output: text };
    const serializedData = JSON.stringify(data);
  
    const params = {
      Data: serializedData,
      PartitionKey: connectionId,
      StreamName: queue,
    };
  
    return new Promise((resolve, reject) => {
      kinesis.putRecord(params, (err, data) => {
        if (err) {
          console.error("Error sending to queue:", err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
export { sendToQueue };