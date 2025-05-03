import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type TInputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  error?: string;
  forgotPasswordLink?: React.ReactNode;
};

export const InputField = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  error,
  forgotPasswordLink = null,
  ...otherProps
}: TInputFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <label className="block text-gray-700 text-sm font-medium" htmlFor={id}>
          {label}
        </label>
        {forgotPasswordLink}
      </div>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={inputType}
          id={id}
          value={value}
          onChange={onChange}
          className={`${icon ? "pl-10" : "pl-4"} w-full p-3 bg-gray-50 border ${
            error ? "border-red-300" : "border-gray-200"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          placeholder={placeholder}
          {...otherProps}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff size={18} className="text-gray-400" />
            ) : (
              <Eye size={18} className="text-gray-400" />
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
