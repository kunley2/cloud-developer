const AWS = require('aws-sdk')
const axios = require('axios')

// Name of a service, any string
const serviceName = process.env.SERVICE_NAME
// URL of a service to test
const url = process.env.URL

// CloudWatch client
const cloudwatch = new AWS.CloudWatch();

exports.handler = async (event) => {
  // TODO: Use these variables to record metric values
  let endTime
  let requestWasSuccessful

  const startTime = timeInMs()
  try{
    await axios.get(url)
    requestWasSuccessful = true
     // TODO: Record time it took to get a response
    endTime = timeInMs()
  }catch (e) {
    console.log(e.message)
    requestWasSuccessful = false

  totalTime = endTime-startTime 

  // Example of how to write a single data point
  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Successful', // Use different metric names for different values, e.g. 'Latency' and 'Successful'
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Count', // 'Count' or 'Milliseconds'
        Value: requestWasSuccessful ? 1 : 0// Total value
      }
    ],
    Namespace: 'Udacity/Serveless'
  }).promise()

  await cloudwatch.putMetricData({
    MetricData: [
      {
        MetricName: 'Latency', // Use different metric names for different values, e.g. 'Latency' and 'Successful'
        Dimensions: [
          {
            Name: 'ServiceName',
            Value: serviceName
          }
        ],
        Unit: 'Milliseconds', // 'Count' or 'Milliseconds'
        Value: totalTime // Total value
      }
    ],
    Namespace: 'Udacity/Serveless'
  }).promise()

 
  // TODO: Record if a response was successful or not
  console.log('response was succesful')
}

function timeInMs() {
  return new Date().getTime()
}
