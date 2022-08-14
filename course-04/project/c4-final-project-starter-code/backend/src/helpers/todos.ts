import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('todo')
// You can provide additional information with every log statement
// This information can then be used to search for log statements in a log storage system

const todosAccess = new TodosAccess()

export async function createTodo(createTodoRequest:CreateTodoRequest,userId:string): Promise<TodoItem>{
    const itemId = uuid.v4()
    const done = false
    logger.info('gotten the itemId for create',{key:itemId})
    return await todosAccess.createTodo({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: done,
        createdAt: new Date().toISOString()
    })
}

export async function getTodosForUser(userId: string){
    return todosAccess.getTodo(userId)
}

export async function updateTodo(userId:string, updateTodoRequest:UpdateTodoRequest,todoId: string) {
    return todosAccess.updateTodo(userId, updateTodoRequest,todoId)
}

export async function deleteTodo(userId: string, todoId: string){
    return todosAccess.deleteTodo(userId, todoId)
}

export async function createAttachmentPresignedUrl(userId: string,todoId: string){
    return AttachmentUtils(userId,todoId)
}