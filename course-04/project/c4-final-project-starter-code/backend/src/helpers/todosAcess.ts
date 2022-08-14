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
        private readonly docClient: DocumentClient = createDynamoDBClient(),
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
        const result = await this.docClient.query({
            TableName: this.todoTable,
            ExpressionAttributeValues: {
                ':user':{'S': userId}
            },
            KeyConditionExpression:'userId = :user'
            // Key: {
            //     userId: userId
            // }
        }).promise()
        logger.info('todo item was gotten successfully'
            )
        const item = result.Items
        return item as TodoItem[]
    }

    async updateTodo(userID: string, item: TodoUpdate, todoId: string): Promise<TodoUpdate>{
        await this.docClient.update({
            TableName: this.todoTable,
            Key:{
                userId: userID,
                todoId: todoId
            },
            UpdateExpression:"set name = :x, dueDate = :y, done = :z ",
            ExpressionAttributeValues:{
                ":x": item.name,
                ":y":item.dueDate,
                ":z": item.done
            }
        }).promise()
        logger.info('todo item was updated successfully'
            )
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

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
      console.log('Creating a local DynamoDB instance')
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }
  