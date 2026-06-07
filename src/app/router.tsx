import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { AddQuestionsPage } from "@/features/questions/AddQuestionsPage";
import {
  CreateEditTestPage,
  DashboardPage,
  PreviewPublishPage,
} from "@/features/tests";
import { ROUTES } from "@/lib/constants";

export const router = createBrowserRouter([
  {
    path: ROUTES.root,
    element: <Navigate to={ROUTES.dashboard} replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.login,
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: ROUTES.dashboard,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.testsCreate,
            element: <CreateEditTestPage />,
          },
          {
            path: ROUTES.testsEdit,
            element: <CreateEditTestPage />,
          },
          {
            path: ROUTES.testsQuestions,
            element: <AddQuestionsPage />,
          },
          {
            path: ROUTES.testsPreview,
            element: <PreviewPublishPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to={ROUTES.root} replace />,
  },
]);
