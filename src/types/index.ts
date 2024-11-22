export interface IUserSignup {
  name: string;
  email: string;
  password: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface PaginatedArgs<E> {
  page?: number;
  size?: number;
  order?: "ASC" | "DESC";
  orderBy?: E;
}
