import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export async function AttachmentUtils(userId: string, todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: {
      userId,
      todoId
    },
    Expires: urlExpiration
  })
}
