import ProvidersBox from "../_components/providers";
import LoginForm from "../_components/login";
import Link from "next/link";

const Login = () => {
  return (
    <div className="m-auto w-full md:w-3/4">
      <h3 className="text-4xl font_playwrite font-semibold text-center py-6">
        Login
      </h3>

      <LoginForm />

      <div className="flex flex-col items-center text-center text-sm text-gray-400 space-y-2 mt-6">
        <p>
          Forgot Password?{" "}
          <Link
            href="/forgot-password"
            className="text-white font-semibold hover:text-slate-300 hover:underline transition-colors"
          >
            Click Here
          </Link>
        </p>
        <p>
          Dont't have an account?{" "}
          <Link
            href="/register"
            className="text-white font-semibold hover:text-slate-300 hover:underline transition-colors"
          >
            Create One
          </Link>
        </p>
        <p>
          Want to register as a seller?{" "}
          <Link
            href="/seller/register"
            className="text-white font-semibold hover:text-slate-300 hover:underline transition-colors"
          >
            Click here
          </Link>
        </p>
      </div>

      <div className="my-6 flex items-center text-center gap-2 px-4">
        <hr className="border-gray-300 w-full" />
        <span className="text-sm text-gray-500">or</span>
        <hr className="border-gray-300 w-full" />
      </div>

      <ProvidersBox role="viewer" />
    </div>
  )
}

export default Login;