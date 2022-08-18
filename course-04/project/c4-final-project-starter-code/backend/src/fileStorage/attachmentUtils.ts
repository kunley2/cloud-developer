import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const logger = createLogger('attachmentUtils')
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const todoTable = process.env.TODOS_TABLE
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const docClient = new XAWS.DynamoDB.DocumentClient()

export async function AttachmentUtils(userId:string,todoId: string) {
  logger.info('gotten and todoid',{todoId:todoId})
  await uploadUrl(userId,todoId)
  logger.info('updated the dynamo')
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key:`${todoId}.png`,
    Expires: urlExpiration
  })
}

async function uploadUrl(userId:string,todoId:string){
  await docClient.update({
    TableName:todoTable,
    Key: {
      userId: userId,
      todoId: todoId
    },
    UpdateExpression:'SET #url = :url',
    ExpressionAttributeNames: {
      "#url":"attachmentUrl"
    },
    ExpressionAttributeValues:{
      ":url": `https://${bucketName}.s3.amazonaws.com/${todoId}.png`
    }    
  }).promise()
}
