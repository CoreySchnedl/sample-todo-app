import { TodoPriority } from "../../shared";

export interface DDBTodo {
  id: string;
  name: string;
  description: string;
  priority: TodoPriority;
}
