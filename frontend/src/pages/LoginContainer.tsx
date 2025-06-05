import { useEffect, useReducer, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Phone } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthLayout } from "../layout/auth/AuthLayout";
import { InputField } from "../components/auth/InputField";
import { RoleSelector } from "../components/auth/RoleSelector";
import { Button } from "../components/Button";
import { useLoginMutation } from "../features/auth/authApi";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import {
  TLoginAction,
  TLoginError,
  TLoginState,
  TUserRole,
} from "../types/index";
import { EMAIL_REGEX } from "../utils";

const initialLoginState: TLoginState = {
  email: "",
  password: "",
  role: "user",
  phone: "",
  errors: {},
  isValid: false,
  submitAttempted: false,
};

const loginReducer = (
  state: TLoginState,
  action: TLoginAction
): TLoginState => {
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
      if (!state.email && !state.phone) {
        errors.email = "Email or Phone is required";
        errors.phone = "Phone or Email is required";
      } else if (state.email && !EMAIL_REGEX.test(state.email)) {
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
    case "SET_SUBMIT_ATTEMPTED":
      return {
        ...state,
        submitAttempted: action.value,
      };
    case "RESET":
      return initialLoginState;
    default:
      return state;
  }
};

export default function LoginContainer() {
  const [state, dispatchReducer] = useReducer(loginReducer, {
    ...initialLoginState,
  });
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [loginUser, { isLoading, isError }] = useLoginMutation();
  const [loading, setLoading] = useState(isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!state.submitAttempted) {
      return;
    }

    if (state.isValid) {
      setLoading(true);
      const performLogin = async () => {
        loginUser({
          email: state.email,
          phone: state.phone,
          password: state.password,
          role: state.role,
        })
          .unwrap()
          .then(() => {
            toast.success("Login successful!");
            navigate("/");
            dispatchReducer({ type: "RESET" });
          })
          .catch((err: { data: { message: string } }) => {
            console.error("Login submission failed:", err);
            toast.error(err.data.message);
            dispatchReducer({ type: "SET_SUBMIT_ATTEMPTED", value: false });
          })
          .finally(() => setLoading(false));
      };

      performLogin();
    } else {
      dispatchReducer({ type: "SET_SUBMIT_ATTEMPTED", value: false });
    }
  }, [
    state.isValid,
    state.submitAttempted,
    state.email,
    state.phone,
    state.password,
    state.role,
    dispatch,
    navigate,
  ]);

  useEffect(() => {
    if (state.submitAttempted) {
      dispatchReducer({ type: "SET_SUBMIT_ATTEMPTED", value: false });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchReducer({
      type: "SET_FIELD",
      field: e.target.id as keyof TLoginState,
      value: e.target.value,
    });
  };

  const handleRoleChange = (role: TUserRole) => {
    dispatchReducer({
      type: "SET_ROLE",
      value: role,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatchReducer({ type: "VALIDATE" });
    dispatchReducer({ type: "SET_SUBMIT_ATTEMPTED", value: true });
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to access your account">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <form>
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
            disabled={loading}
          />
          <div className="flex justify-center items-center my-2">
            <hr className="w-[50%] text-gray-300" />
            <p className="text-center px-2 text-gray-500 text-sm">or</p>
            <hr className="w-[50%] text-gray-300" />
          </div>
          <InputField
            id="phone"
            label="Phone number"
            type="number"
            placeholder="Phone number"
            value={state.phone}
            onChange={handleChange}
            icon={<Phone size={18} className="text-gray-400" />}
            error={state.errors.phone}
            disabled={loading}
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
            disabled={loading}
          />
          <Button
            onClick={handleSubmit}
            // type="submit"
            isLoading={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
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
