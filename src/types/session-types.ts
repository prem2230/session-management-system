
export interface ISessionData {
    userId: string;
    email: string;
    username: string;
    createdAt: number;
}

export interface IRegisterInput {
    username: string;
    email: string;
    password: string;
    age: number;
}