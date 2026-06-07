import { zodResolver } from "@hookform/resolvers/zod";
import { ExclamationCircleIcon as AlertCircle } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginIllustration from "@/assets/timeglass.png";
import prepRouteLogo from "@/assets/login/preproute-logo.svg";
import { ROUTES } from "@/lib/constants";
import { setAuthToken } from "@/lib/storage";

import { login } from "./api";
import { type LoginFormValues, loginSchema } from "./schema";

type LoginLocationState = {
  from?: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setServerError("");

      const response = await login(values);
      const token = response.data.data?.token ?? response.data.data?.accessToken;

      if (!token) {
        setServerError("Login response did not include a token.");
        return;
      }

      setAuthToken(token);

      const state = location.state as LoginLocationState | null;
      navigate(state?.from || ROUTES.dashboard, { replace: true });
    } catch (error) {
      setServerError("Invalid credentials or unable to login right now.");
      console.error(error);
    }
  });

  return (
    <div className="grid w-full overflow-hidden rounded-[10px] border border-[#B7D6FF] bg-white lg:grid-cols-[1fr_1.02fr]">
      <section className="hidden items-center justify-center border-r border-[#D9EAFF] bg-[#F5FAFF] px-10 py-12 lg:flex">
        <div className="w-[467px]">
          <img
            src={loginIllustration}
            alt=""
            width={467}
            height={344}
            className="h-[344px] w-[467px] object-contain"
          />
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[356px]">
          <div className="mb-8">
            <img
              src={prepRouteLogo}
              alt="PrepRoute"
              className="h-auto w-[134.74px]"
            />
          </div>

          <div className="space-y-[10px]">
            <h1 className="w-[79px] text-[29px] font-semibold leading-[30px] text-surface-dark">
              Login
            </h1>
            <p className="w-[260px] text-xs leading-[18px] text-content-subtle">
              Use your company provided Login credentials
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            {serverError ? (
              <Alert className="border-status-danger-border bg-status-danger-bg text-[#9B3D3D]">
                <AlertCircle className="size-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2.5">
              <Label
                htmlFor="userId"
                className="h-6 w-[56px] text-base font-medium leading-6 text-surface-dark"
              >
                User ID
              </Label>
              <Input
                id="userId"
                placeholder="Enter User ID"
                autoComplete="username"
                className="h-[46px] rounded-md border-[#D7E0EB] bg-white px-3 text-sm text-surface-dark placeholder:text-[#B8C1CC] focus-visible:border-[#7BA4F8] focus-visible:ring-2 focus-visible:ring-[#7BA4F8]/20"
                {...form.register("userId")}
              />
              {form.formState.errors.userId ? (
                <p className="text-xs text-status-danger">
                  {form.formState.errors.userId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2.5">
              <Label
                htmlFor="password"
                className="h-6 w-[56px] text-base font-medium leading-6 text-surface-dark"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter Password"
                autoComplete="current-password"
                className="h-[46px] rounded-md border-[#D7E0EB] bg-white px-3 text-sm text-surface-dark placeholder:text-[#B8C1CC] focus-visible:border-[#7BA4F8] focus-visible:ring-2 focus-visible:ring-[#7BA4F8]/20"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-xs text-status-danger">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              className="h-[21px] w-[119px] text-left text-sm font-medium leading-[21px] text-brand-alt"
            >
              Forgot password?
            </button>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-[42px] w-full rounded-md border-0 bg-[#5C84E6] text-sm font-medium leading-6 text-white hover:bg-[#4F78DE]"
            >
              {form.formState.isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
