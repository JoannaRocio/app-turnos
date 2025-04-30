import { UserRole } from "./UserRole";

export interface User {
    id: number;
    username: string;
    password: string;
    email: string;
    role: UserRole;
}