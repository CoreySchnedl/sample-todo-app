import { TodoPriority } from "../../shared";

export enum DDBRecordType {
  TODO = "TODO",
}

export type DDBTodoWithoutRecordType = Omit<DDBTodo, "recordType">;

export interface DDBTodo {
  id: string;
  recordType: DDBRecordType.TODO;
  name: string;
  description: string;
  priority: TodoPriority;
}
