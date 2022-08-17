import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

// import { getUserId } from '../lambda/utils'

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');

// TODO: Implement the dataLayer logic

export class TodosAccess{
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODOS_TABLE
    ) {}

    async createTodo(item:TodoItem): Promise<TodoItem>{
        await this.docClient.put({
            TableName: this.todoTable,
            Item: item
        }).promise()
        logger.info('created todo successfully', {
            // Additional information stored with a log statement
            key: item
            })
        return item
    }

    async getTodo(userId: string): Promise<TodoItem[]>{
        logger.info(`getting items for user: ${userId}`)
        try{
            const result = await this.docClient.query({
                TableName: this.todoTable,
                ExpressionAttributeValues: {
                    ':user': userId
                },
                KeyConditionExpression:'userId = :user'
                // Key: {
                //     userId: userId
                // }
            }).promise()
            // if(result.Items.length ==0){
            //    const item = []
            //    return item
            // }
            logger.info('todo item was gotten successfully',{key:result.Items})
            return result.Items as TodoItem[]
        }catch (error){
            logger.info('error while obtaining record',{key:error.message})
        }
        
    }

    async updateTodo(userID: string, item: TodoUpdate, todoId: string): Promise<TodoUpdate>{
        logger.info('gotten the update params',{key:item})
        const result = await this.docClient.update({
            TableName: this.todoTable,
            Key:{
                userId: userID,
                todoId: todoId
            },
            UpdateExpression: "set #name = :x,  #duedate= :y, #done = :z ",
            ExpressionAttributeNames: {
                '#name': 'name',
                '#duedate': 'dueDate',
                '#done': 'done'
            },
            ExpressionAttributeValues:{
                ":x": item.name,
                ":y":item.dueDate,
                ":z": item.done
            },
            ReturnValues: "UPDATED_NEW",
        }).promise()
        logger.info('todo item was updated successfully',
        {key:result})
        return item
    }

    async deleteTodo(userId: string, todoId: string) {
        await this.docClient.delete({
            TableName: this.todoTable,
            Key: {
                userId: userId,
                todoId:todoId
            }            
        }).promise()
        logger.info('todo item was deleted successfully'
            )
    }
}

// function createDynamoDBClient() {
//     if (process.env.IS_OFFLINE) {
//       console.log('Creating a local DynamoDB instance')
//       return new XAWS.DynamoDB.DocumentClient({
//         region: 'localhost',
//         endpoint: 'http://localhost:8000'
//       })
//     }
  
//     return new XAWS.DynamoDB.DocumentClient()
//   }
  