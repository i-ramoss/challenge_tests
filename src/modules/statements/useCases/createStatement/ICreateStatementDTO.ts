import { OperationType } from "../../entities/Statement";

interface ICreateStatementDTO {
  user_id: string;
  sender_id?: string;
  description: string;
  amount: number;
  type: OperationType;
}

export { ICreateStatementDTO };
