import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { SetOptional } from "type-fest";
import { DDBTodo } from "../../models/DDBModels";
import { uuid } from "uuidv4";
import {
  CreateTodoInput,
  CreateTodoOutput,
  GetTodoByIdInput,
  GetTodoByIdOutput,
  ITodoService,
} from "./types";
import { TodoPriority } from "@shared/enums";

const TABLE_NAME_TODO = process.env.TABLE_NAME_TODO!;

export interface TodoServiceParams {
  documentClient: DynamoDBDocument;
}

export class TodoService implements ITodoService {
  private documentClient: DynamoDBDocument;

  constructor(input: TodoServiceParams) {
    this.documentClient = input.documentClient;
  }

  private translate(record: SetOptional<DDBTodo, "id">): DDBTodo {
    const id = record.id || this.generateId();

    return {
      id,
      name: record.name || "",
      description: record.description || "",
      priority: record.priority || TodoPriority.LOW,
    };
  }

  private generateId(): string {
    return uuid();
  }

  public async getTodoById(
    input: GetTodoByIdInput
  ): Promise<GetTodoByIdOutput> {
    const result = await this.documentClient.get({
      TableName: TABLE_NAME_TODO,
      Key: {
        id: input.id,
      },
    });

    if (!result.Item) {
      throw Error("Item not found");
    }

    return result.Item as DDBTodo;
  }

  public async createTodo(input: CreateTodoInput): Promise<CreateTodoOutput> {
    const item = this.translate(input);

    await this.documentClient.put({
      TableName: TABLE_NAME_TODO,
      Item: item,
    });

    return item as DDBTodo;
  }
}
