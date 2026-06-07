export const API_BASE_URL = "/api";

export const AUTH_TOKEN_KEY = "auth_token";

export const ROUTES = {
  root: "/",
  login: "/login",
  dashboard: "/dashboard",
  testsCreate: "/tests/create",
  testsEdit: "/tests/:id/edit",
  testsQuestions: "/tests/:id/questions",
  testsPreview: "/tests/:id/preview",
} as const;
