export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "reviewer" | "school";
  status: "active" | "inactive";
};
