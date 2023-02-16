import { TodoPriority } from "@shared/enums";

export enum DDBRecordType {
  TODO = "TODO",
}

export type DDBTodoWithoutRecordType = Omit<DDBTodo, "recordType">;
export type DDBTodoWithoutRecordTypeOrSub = Omit<DDBTodo, "recordType" | "sub">;

export interface DDBTodo {
  id: string;
  recordType: DDBRecordType.TODO;
  sub: string;
  name: string;
  description?: string;
  priority: TodoPriority;
}
