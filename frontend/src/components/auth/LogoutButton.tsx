import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { logoutUser } from "../../features/auth/authServices";
import { Button } from "../Button";

interface LogoutButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "outline",
  size = "md",
  className = "",
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={`flex items-center ${className}`}
    >
      <LogOut size={16} className="mr-2" />
      Sign Out
    </Button>
  );
};

export default LogoutButton;
