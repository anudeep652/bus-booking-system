export const operatorStatus =  {
  pending : "pending",
  verified : "verified",
  rejected : "rejected",
} as const;
export type OperatorStatus = keyof typeof operatorStatus;

export type Operator = {
  company_name: string;
  email: string;
  phone: string;
  password: string;
  verification_status: OperatorStatus;
};
