import { useEffect, useReducer } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone } from "lucide-react";
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
} from "../features/auth/authSlice";
import { registerUser } from "../features/auth/authServices";
import { TRegisterError, TUserRole } from "../types";

const initialRegisterState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "user",
  adminCode: "",
  employeeId: "",
  errors: {},
  isValid: false,
};

const registerReducer = (
  state: typeof initialRegisterState & { errors: TRegisterError },
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
      const errors: TRegisterError = {};

      if (!state.name) errors.name = "Full name is required";

      if (!state.email) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(state.email))
        errors.email = "Email is invalid";

      if (!state.phone) errors.phone = "Phone number is required";
      else if (!/^\d{10}$/.test(state.phone.replace(/[^0-9]/g, ""))) {
        errors.phone = "Phone number is invalid";
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

      if (state.role === "admin" && !state.adminCode) {
        errors.adminCode = "Admin verification code is required";
      }
      if (state.role === "operator" && !state.employeeId) {
        errors.employeeId = "Employee ID is required";
      }

      return {
        ...state,
        errors,
        isValid: Object.keys(errors).length === 0,
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
  const [register, { isLoading }] = useRegisterMutation();
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
    dispatchReducer({ type: "SET_ROLE", value: role });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatchReducer({ type: "VALIDATE" });

    const errors: TRegisterError = {};

    if (!state.name) errors.name = "Full name is required";

    if (!state.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(state.email))
      errors.email = "Email is invalid";

    if (!state.phone) errors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(state.phone.replace(/[^0-9]/g, ""))) {
      errors.phone = "Phone number is invalid";
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

    if (state.role === "admin" && !state.adminCode) {
      errors.adminCode = "Admin verification code is required";
    }
    if (state.role === "operator" && !state.employeeId) {
      errors.employeeId = "Employee ID is required";
    }

    const isValid = Object.keys(errors).length === 0;

    if (isValid) {
      try {
        const registerData = {
          name: state.name,
          email: state.email,
          phone: state.phone,
          password: state.password,
          role: state.role,
          ...(state.role === "admin" && { adminCode: state.adminCode }),
          ...(state.role === "operator" && { employeeId: state.employeeId }),
        };

        await dispatch(registerUser(registerData)).unwrap();
        toast.success("Registration successful!");
      } catch (err) {
        console.error(err);
      }
    } else {
      dispatchReducer({
        type: "VALIDATE",
      });
    }
  };

  const renderRoleSpecificFields = () => {
    if (state.role === "admin") {
      return (
        <InputField
          id="adminCode"
          label="Admin Code"
          type="text"
          placeholder="Enter admin verification code"
          value={state.adminCode || ""}
          onChange={handleChange}
          error={state.errors.adminCode}
          disabled={isLoading}
        />
      );
    } else if (state.role === "operator") {
      return (
        <InputField
          id="employeeId"
          label="Employee ID"
          type="text"
          placeholder="Enter your employee ID"
          value={state.employeeId || ""}
          onChange={handleChange}
          error={state.errors.employeeId}
          disabled={isLoading}
        />
      );
    }
    return null;
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <InputField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            value={state.confirmPassword}
            onChange={handleChange}
            icon={<Lock size={18} className="text-gray-400" />}
            error={state.errors.confirmPassword}
            disabled={isLoading}
          />

          {renderRoleSpecificFields()}

          <Button
            onClick={() => {}}
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
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
