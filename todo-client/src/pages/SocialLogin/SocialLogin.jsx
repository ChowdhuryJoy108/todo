import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from '../../hooks/useAxiosPublic'
import useAuth from '../../hooks/useAuth'
const SocialLogin = () => {
    const { googleSignIn } = useAuth();
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();

    const handleGoogleSignIn = () => {
      googleSignIn().then((result) => {
        console.log(result.user);
        const userInfo = {
          email: result.user?.email,
          name: result.user?.displayName,
          profile: result.user?.photoURL || "",
        };
        axiosPublic.post("/user", userInfo).then((res) => {
          console.log(res.data);
          navigate("/todoHome");
        });
      });
    };

  return (
    <div className="flex flex-col items-center align-middle">
      <div className="flex flex-col gap-4 items-center mt-[200px]">
        <h2 className="text-6xl font-bold">Your Personal Task Manager!</h2>
        <p className="text-2xl text-gray-600">Track, plan, and complete your tasks with ease.</p>
        <p className="text-lg font-semibold">To Start Managing Your Task - Sign Yourself Below</p>
      </div>
      <div className="w-1/2">
        <Button
          variant="outlined"
          size="lg"
          className="text-xs mt-6 flex h-12 items-center justify-center gap-2 lg:text-sm"
          fullWidth
          onClick={handleGoogleSignIn}
        >
          <img
            src={`https://www.material-tailwind.com/logos/logo-google.png`}
            alt="google"
            className="h-6 w-6"
          />{" "}
          Sign in with Google
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;
