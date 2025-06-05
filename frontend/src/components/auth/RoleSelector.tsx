import { User, Shield, Headphones } from "lucide-react";
import { TUserRole } from "../../types";

export const RoleSelector = ({
  selectedRole,
  onRoleChange,
}: {
  selectedRole: TUserRole;
  onRoleChange: (role: TUserRole) => void;
}) => {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-medium mb-3">
        Select Role
      </label>
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onRoleChange("user")}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            selectedRole === "user"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
          }`}
        >
          <User
            size={20}
            className={
              selectedRole === "user" ? "text-indigo-600" : "text-gray-500"
            }
          />
          <span className="mt-2 text-sm font-medium">Customer</span>
        </button>

        <button
          type="button"
          onClick={() => onRoleChange("admin")}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            selectedRole === "admin"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
          }`}
        >
          <Shield
            size={20}
            className={
              selectedRole === "admin" ? "text-indigo-600" : "text-gray-500"
            }
          />
          <span className="mt-2 text-sm font-medium">Admin</span>
        </button>

        <button
          type="button"
          onClick={() => onRoleChange("operator")}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            selectedRole === "operator"
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
          }`}
        >
          <Headphones
            size={20}
            className={
              selectedRole === "operator" ? "text-indigo-600" : "text-gray-500"
            }
          />
          <span className="mt-2 text-sm font-medium">Operator</span>
        </button>
      </div>
    </div>
  );
};
