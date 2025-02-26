import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
const SocialLogin = () => {
  const { googleSignIn } = useAuth();
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    googleSignIn().then((result) => {
      // console.log(result.user);
      const userInfo = {
        email: result.user?.email,
        name: result.user?.displayName,
        profile: result.user?.photoURL || "",
      };
      axiosPublic.post("/user", userInfo).then((res) => {
        Swal.fire({
          icon: "success",
          title: "Log in Successfull",
        });
        navigate("/todoHome");
      });
    });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Helmet>
        <title>ToDos || Login </title>
      </Helmet>
      <div className="flex flex-col gap-4 items-center mt-10 md:mt-20 lg:mt-[200px] px-4">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center">
          Your Personal Task Manager!
        </h2>
        <p className="text-xl sm:text-2xl text-gray-600 text-center">
          Track, plan, and complete your tasks with ease.
        </p>
        <p className="text-base sm:text-lg font-semibold text-center">
          To Start Managing Your Task - Sign Yourself Below
        </p>
      </div>
      <div className="w-full px-2 sm:w-3/4 md:w-1/2 lg:w-1/3">
        <Button
          variant="outlined"
          size="lg"
          className="text-xs  sm:text-sm mt-6 flex h-12 items-center justify-center gap-2 w-full"
          onClick={handleGoogleSignIn}
        >
          <img
            src={`https://www.material-tailwind.com/logos/logo-google.png`}
            alt="google"
            className="h-6 w-6"
          />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;
