import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import handleSubmit from "../../../utils/handleForm";

const Login = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const errorMessage = (requestError) => requestError.response?.data?.errors?.map((item) => item.msg).join("; ") || requestError.response?.data?.error || "Не удалось войти. Проверьте данные и доступность сервера.";

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 selection:bg-purple-500/30">
      <div className="flex flex-col md:flex-row bg-neutral-900 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden max-w-4xl w-full border border-neutral-800">
        {/* Left Side: Branding / Visual (Hidden on Mobile) */}
        <div className="md:w-1/2 p-10 lg:p-12 bg-neutral-950/50 text-white flex-col justify-between relative overflow-hidden hidden md:flex border-r border-neutral-800">
          <div className="z-10">
            <h1 className="text-4xl lg:text-5xl tracking-tight mb-2">
              Best<span className="text-purple-600">gram</span>
            </h1>
            <p className="text-neutral-400 text-lg font-medium">
              Welcome back.
            </p>
          </div>

          <div className="z-10 mt-auto">
            <h2 className="text-3xl lg:text-4xl mb-4 leading-tight">
              Log in to keep <br /> exploring.
            </h2>
            <p className="text-neutral-400 font-medium text-lg">
              Pick up right where you left off.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-neutral-900 relative">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden text-center mb-8">
              <h1 className="text-4xl font-medium text-white mb-2">
                Best<span className="text-purple-500">gram</span>
              </h1>
              <p className="text-neutral-400 text-sm">
                Log in to see photos and videos from your friends.
              </p>
            </div>

            <h3 className="text-2xl text-white mb-6 hidden md:block">
              Welcome back
            </h3>

            <form
              onSubmit={(e) => {
                setError("");
                setSubmitting(true);
                void handleSubmit(e, async (obj) => {
                  try {
                    await handleLogin(obj);
                    navigate("/");
                  } catch (error) {
                    setError(errorMessage(error));
                  } finally {
                    setSubmitting(false);
                  }
                }).catch((requestError) => setError(errorMessage(requestError)));
              }}
              className="space-y-4"
            >
              {/* Email Input */}
              <div className="relative">
                <input
                  type="text"
                  name="usernameOrEmail"
                  id="usernameOrEmail"
                  placeholder="Username or Email"
                  className="peer w-full px-4 pt-6 pb-2 border-2 border-neutral-800 rounded-xl bg-neutral-950 text-white focus:outline-none focus:border-purple-500 focus:bg-neutral-900 transition-all placeholder-transparent"
                  required
                />
                <label
                  htmlFor="usernameOrEmail"
                  className="absolute left-4 top-2 text-xs font-semibold text-neutral-500 transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-purple-400"
                >
                  Username or Email
                </label>
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Password"
                  className="peer w-full px-4 pt-6 pb-2 pr-14 border-2 border-neutral-800 rounded-xl bg-neutral-950 text-white focus:outline-none focus:border-purple-500 focus:bg-neutral-900 transition-all placeholder-transparent"
                  required
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 top-2 text-xs font-semibold text-neutral-500 transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-purple-400"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white focus:outline-none text-sm font-medium transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right mt-2 pb-2">
                <a
                  href="#"
                  className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="w-full bg-linear-to-bl from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-medium py-3.5 px-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(168,85,247,0.4)] transform transition-colors duration-300 active:scale-[0.98] cursor-pointer"
                >
                  {submitting ? "Signing in…" : "Log In"}
                </button>
              </div>
              {error ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

            </form>

            <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
              <p className="text-neutral-400 text-sm font-medium">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 hover:opacity-80 transition-opacity"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
