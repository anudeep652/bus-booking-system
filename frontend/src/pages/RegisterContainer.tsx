import { useEffect, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, Building2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthLayout } from "../layout/auth/AuthLayout";
import { InputField } from "../components/auth/InputField";
import { RoleSelector } from "../components/auth/RoleSelector";
import { Button } from "../components/Button";
import { useRegisterMutation } from "../features/auth/authApi";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  selectIsAuthenticated,
  selectAuthError,
  clearError,
} from "../features/auth/authSlice";
import { registerUser } from "../features/auth/authServices";
import {
  TRegisterAction,
  TRegisterError,
  TRegisterState,
  TUserRole,
} from "../types";
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  REMOVE_WHITESPACE_FROM_PHONE_REGEX,
} from "../utils";

const initialRegisterState: TRegisterState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "user",
  errors: {},
  isValid: false,
  companyName: "",
  submitAttempted: false,
};

const registerReducer = (state: TRegisterState, action: TRegisterAction) => {
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
      const errors: TRegisterError = {};

      if (!state.name) errors.name = "Full name is required";

      if (!state.email && !state.phone) {
        errors.email = "Email or Phone is required";
        errors.phone = "Phone or Email is required";
      } else if (state.email && !EMAIL_REGEX.test(state.email)) {
        errors.email = "Email is invalid";
      }

      if (state.email && !EMAIL_REGEX.test(state.email))
        errors.email = "Email is invalid";

      if (
        state.phone &&
        !PHONE_REGEX.test(
          state.phone.replace(REMOVE_WHITESPACE_FROM_PHONE_REGEX, "")
        )
      ) {
        errors.phone = "Phone number is invalid";
      }

      if (state.role === "operator" && !state.companyName) {
        errors.companyName = "Company name is required";
      }

      if (!state.password) errors.password = "Password is required";
      else if (state.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (!state.confirmPassword)
        errors.confirmPassword = "Please confirm your password";
      else if (state.password !== state.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
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
    case "SET_VALIDATION_RESULT":
      return {
        ...state,
        isValid: action.isValid,
      };
    default:
      return state;
  }
};

export default function RegisterContainer() {
  const [state, dispatchReducer] = useReducer(
    registerReducer,
    initialRegisterState
  );
  const [_, { isLoading }] = useRegisterMutation();
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
    if (!state.submitAttempted) {
      return;
    }

    if (state.isValid) {
      const performRegister = async () => {
        try {
          const registerData = {
            name: state.name,
            email: state.email,
            phone: state.phone,
            password: state.password,
            role: state.role,
            company_name: state.companyName,
          };

          await dispatch(registerUser(registerData)).unwrap();
          toast.success("Registration successful!");
        } catch (err) {
          console.error(err);
          dispatchReducer({ type: "SET_SUBMIT_ATTEMPTED", value: false });
        }
      };

      performRegister();
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
    if (authError) {
      toast.error(authError);
      dispatch(clearError());
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchReducer({
      type: "SET_FIELD",
      field: e.target.id as keyof TRegisterState,
      value: e.target.value,
    });
  };

  const handleRoleChange = (role: TUserRole) => {
    dispatchReducer({ type: "SET_ROLE", value: role });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatchReducer({ type: "VALIDATE" });
    dispatchReducer({ type: "SET_SUBMIT_ATTEMPTED", value: true });
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register to book your bus tickets"
    >
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <RoleSelector
            selectedRole={state.role}
            onRoleChange={handleRoleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="name"
              label="Full Name"
              placeholder="full name"
              value={state.name}
              onChange={handleChange}
              icon={<User size={18} className="text-gray-400" />}
              error={state.errors.name}
              disabled={isLoading}
            />

            <InputField
              id="email"
              label="Email Address"
              type="email"
              placeholder="email address"
              value={state.email}
              onChange={handleChange}
              icon={<Mail size={18} className="text-gray-400" />}
              error={state.errors.email}
              disabled={isLoading}
            />
          </div>

          <div
            className={`grid grid-cols-1  gap-4 ${
              state.role !== "operator" ? "grid-cols-1" : "md:grid-cols-2"
            }`}
          >
            <InputField
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="phone number"
              value={state.phone}
              onChange={handleChange}
              icon={<Phone size={18} className="text-gray-400" />}
              error={state.errors.phone}
              disabled={isLoading}
            />
            {state.role === "operator" && (
              <InputField
                id="companyName"
                label="Company name"
                type="text"
                placeholder="Company name"
                value={state.companyName}
                onChange={handleChange}
                icon={<Building2 size={18} className="text-gray-400" />}
                error={state.errors.companyName}
                disabled={isLoading}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="password"
              label="Password"
              type="password"
              placeholder="password"
              value={state.password}
              onChange={handleChange}
              icon={<Lock size={18} className="text-gray-400" />}
              error={state.errors.password}
              disabled={isLoading}
            />
            <InputField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm "
              value={state.confirmPassword}
              onChange={handleChange}
              icon={<Lock size={18} className="text-gray-400" />}
              error={state.errors.confirmPassword}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </div>

      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm">
          Already have an account?
          <Link
            to="/login"
            className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
