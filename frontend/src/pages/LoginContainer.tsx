import { useEffect, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthLayout } from "../layout/auth/AuthLayout";
import { InputField } from "../components/auth/InputField";
import { RoleSelector } from "../components/auth/RoleSelector";
import { Button } from "../components/Button";
import { useLoginMutation } from "../features/auth/authApi";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  selectIsAuthenticated,
  selectAuthError,
} from "../features/auth/authSlice";
import { loginUser } from "../features/auth/authServices";
import { TLoginError, TUserRole } from "../types/index";

const initialLoginState = {
  email: "",
  password: "",
  role: "user",
  errors: {},
  isValid: false,
};

const loginReducer = (
  state: typeof initialLoginState & { errors: TLoginError },
  action: any
) => {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
        errors: {
          ...state.errors,
          [action.field]: "",
        },
      };
    case "SET_ROLE":
      return {
        ...state,
        role: action.value,
      };
    case "VALIDATE":
      const errors: TLoginError = {};
      if (!state.email) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(state.email)) {
        errors.email = "Email is invalid";
      }
      if (!state.password) {
        errors.password = "Password is required";
      } else if (state.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
      return {
        ...state,
        errors,
        isValid: Object.keys(errors).length === 0,
      };
    default:
      return state;
  }
};

export default function LoginContainer() {
  const [state, dispatchReducer] = useReducer(loginReducer, initialLoginState);
  const [_login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authError = useAppSelector(selectAuthError);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (authError) {
      toast.error(authError);
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchReducer({
      type: "SET_FIELD",
      field: e.target.id,
      value: e.target.value,
    });
  };

  const handleRoleChange = (role: TUserRole) => {
    dispatchReducer({
      type: "SET_ROLE",
      value: role,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatchReducer({ type: "VALIDATE" });

    if (state.isValid) {
      try {
        await dispatch(
          loginUser({
            email: state.email,
            password: state.password,
            role: state.role,
          })
        ).unwrap();
        toast.success("Login successful!");
        navigate("/");
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to access your account">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit}>
          <RoleSelector
            selectedRole={state.role}
            onRoleChange={handleRoleChange}
          />
          <InputField
            id="email"
            label="Email Address"
            type="email"
            placeholder="Your email address"
            value={state.email}
            onChange={handleChange}
            icon={<Mail size={18} className="text-gray-400" />}
            error={state.errors.email}
            disabled={isLoading}
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={state.password}
            onChange={handleChange}
            icon={<Lock size={18} className="text-gray-400" />}
            error={state.errors.password}
            disabled={isLoading}
          />
          <Button onClick={() => {}} type="submit" isLoading={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          Don't have an account?
          <Link
            to="/register"
            className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
