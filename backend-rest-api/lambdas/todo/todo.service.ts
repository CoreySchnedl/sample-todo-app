import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { TodoPriority } from "@shared/enums";
import { SetOptional } from "type-fest";
import { v4 as uuidv4 } from "uuid";
import {
  DDBRecordType,
  DDBTodo,
  DDBTodoWithoutRecordType,
} from "../../models/DDBModels";
import {
  CreateTodoInput,
  CreateTodoOutput,
  GetTodoByIdInput,
  GetTodoByIdOutput,
  ITodoService,
} from "./types";

const TABLE_NAME_MAIN = process.env.TABLE_NAME_MAIN!;

export interface TodoServiceParams {
  documentClient: DynamoDBDocument;
}

export class TodoService implements ITodoService {
  static RECORD_TYPE = DDBRecordType.TODO;

  private documentClient: DynamoDBDocument;

  constructor(input: TodoServiceParams) {
    this.documentClient = input.documentClient;
  }

  private translate(
    record: SetOptional<DDBTodo, "id" | "recordType">
  ): DDBTodo {
    const id = record.id || this.generateId();

    return {
      id,
      recordType: TodoService.RECORD_TYPE,
      name: record.name || "",
      description: record.description || "",
      priority: record.priority || TodoPriority.LOW,
    };
  }

  private removeRecordType(item: DDBTodo): DDBTodoWithoutRecordType {
    const { recordType, ...result } = item;

    return result;
  }

  private generateId(): string {
    return uuidv4();
  }

  public async getTodoById(
    input: GetTodoByIdInput
  ): Promise<GetTodoByIdOutput> {
    const result = await this.documentClient.get({
      TableName: TABLE_NAME_MAIN,
      Key: {
        id: input.id,
      },
    });

    if (!result.Item) {
      throw Error("Item not found");
    }

    return this.removeRecordType(result.Item as DDBTodo);
  }

  public async createTodo(input: CreateTodoInput): Promise<CreateTodoOutput> {
    const item = this.translate(input);

    await this.documentClient.put({
      TableName: TABLE_NAME_MAIN,
      Item: item,
    });

    return this.removeRecordType(item);
  }
}
