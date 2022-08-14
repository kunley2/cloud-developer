import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { getAllGroups } from '../../businessLogic/groups';

import * as awsServerlessExpress from 'aws-serverless-express'
import * as express from 'express'

// export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//   console.log('Processing event: ', event)

//   const groups = await getAllGroups()

//   return {
//     statusCode: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*'
//     },
//     body: JSON.stringify({
//       items: groups
//     })
//   }
// }

const app = express()

app.get("/groups", async (request,response) =>{
  const groups = await getAllGroups()
  response.statusCode(200)
  response.json({
    items:groups})
})

const server = awsServerlessExpress.createServer(app)
exports.handler = (event,context) =>{
  awsServerlessExpress.proxy(server,event,context)
}