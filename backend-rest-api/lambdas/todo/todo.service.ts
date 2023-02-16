import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { GSI_SUB_RECORDTYPE } from "@shared/constants";
import { TodoPriority } from "@shared/enums";
import { SetOptional } from "type-fest";
import { v4 as uuidv4 } from "uuid";
import {
  DDBRecordType,
  DDBTodo,
  DDBTodoWithoutRecordTypeOrSub,
} from "../../models/ddbmodels";
import { generateUpdateExpression } from "../../utils/dynamodb";
import {
  CreateTodoInput,
  CreateTodoOutput,
  DeleteTodoInput,
  GetTodoByIdInput,
  GetTodoByIdOutput,
  GetTodosBySubInput,
  GetTodosBySubOutput,
  ITodoService,
  UpdateTodoInput,
  UpdateTodoOutput,
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
      sub: record.sub,
      name: record.name,
      description: record.description || "",
      priority: record.priority || TodoPriority.LOW,
    };
  }

  private removeRecordTypeAndSub(item: DDBTodo): DDBTodoWithoutRecordTypeOrSub {
    const { recordType, sub, ...result } = item;

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

    return this.removeRecordTypeAndSub(result.Item as DDBTodo);
  }

  public async createTodo(input: CreateTodoInput): Promise<CreateTodoOutput> {
    const item = this.translate(input);

    await this.documentClient.put({
      TableName: TABLE_NAME_MAIN,
      Item: item,
    });

    return this.removeRecordTypeAndSub(item);
  }

  public async updateTodo(input: UpdateTodoInput): Promise<UpdateTodoOutput> {
    const item = this.translate(input);

    const { id, recordType, ...attributesToUpdate } = item;

    await this.documentClient.update({
      TableName: TABLE_NAME_MAIN,
      Key: {
        id,
        recordType,
      },
      ...generateUpdateExpression(attributesToUpdate),
    });

    return this.removeRecordTypeAndSub(item);
  }

  public async deleteTodo(input: DeleteTodoInput): Promise<boolean> {
    await this.documentClient.delete({
      TableName: TABLE_NAME_MAIN,
      Key: {
        id: input.id,
        recordType: TodoService.RECORD_TYPE,
      },
    });

    return true;
  }

  public async getTodosBySub(
    input: GetTodosBySubInput
  ): Promise<GetTodosBySubOutput> {
    const results = await this.documentClient.query({
      TableName: TABLE_NAME_MAIN,
      IndexName: GSI_SUB_RECORDTYPE.name,
      KeyConditionExpression: "#sub = :sub and #recordType = :recordType",
      ExpressionAttributeNames: {
        "#sub": "sub",
        "#recordType": "recordType",
      },
      ExpressionAttributeValues: {
        ":sub": input.sub,
        ":recordType": TodoService.RECORD_TYPE,
      },
    });

    const mappedResults: GetTodosBySubOutput = (results.Items || []).map(
      (item) => this.removeRecordTypeAndSub(item as DDBTodo)
    );

    return mappedResults;
  }
}
