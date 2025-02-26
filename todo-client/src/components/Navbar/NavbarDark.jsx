import { Navbar, Typography, Button } from "@material-tailwind/react";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export function NavbarDark() {
  const { googleSignOut } = useAuth();
  const navigate = useNavigate()

  const handleLogOut = () => {
    googleSignOut().then(() => {
      Swal.fire({
        icon: "success",
        title: "Logged Out Successsfull!",
      });
      navigate(-1)
    });
  };
  return (
    <Navbar
      variant="gradient"
      color="blue-gray"
      className="mx-auto max-w-screen-xl from-blue-gray-900 to-blue-gray-800 px-4 py-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-y-4 text-gray-800">
        <Typography
          as="a"
          href="#"
          variant="h6"
          className="mr-4 ml-2 cursor-pointer py-1.5"
        >
          Task Manager
        </Typography>

        <div>
          <Button
            onClick={handleLogOut}
            className="bg-red-300 text-xs text-white"
          >
            Log Out
          </Button>
        </div>
      </div>
    </Navbar>
  );
}
