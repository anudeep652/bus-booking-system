enum OperatorStatus {
  Pending = "pending",
  Verified = "verified",
  Rejected = "rejected",
}

export type Operator = {
  company_name: string;
  email: string;
  phone: string;
  password: string;
  verification_status: OperatorStatus;
};
