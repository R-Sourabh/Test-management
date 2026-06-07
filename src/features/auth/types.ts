export type LoginPayload = {
  userId: string;
  password: string;
};

export type LoginResponse = {
  status: string;
  message: string;
  data: {
    token?: string;
    accessToken?: string;
    user?: {
      id: string;
      userId: string;
      name: string;
      role: string;
      subrole?: string;
    };
  };
};
