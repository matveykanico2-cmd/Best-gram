import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import handleSubmit from "../../../utils/handleForm";

const Register = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  const errorMessage = (requestError) => requestError.response?.data?.errors?.map((item) => item.msg).join("; ") || requestError.response?.data?.error || "Не удалось зарегистрироваться. Проверьте данные и доступность сервера.";

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 selection:bg-purple-500/30">
      <div className="flex flex-col md:flex-row bg-neutral-900 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden max-w-4xl w-full border border-neutral-800">
        <div className="md:w-1/2 p-10 lg:p-12 bg-neutral-950/50 text-white flex-col justify-between relative overflow-hidden hidden md:flex border-r border-neutral-800">
          <div className="z-10">
            <h1 className="text-4xl lg:text-5xl tracking-tight mb-2">
              Best<span className="text-purple-600">gram</span>
            </h1>
            <p className="text-neutral-400 text-lg font-medium">
              Join the visual world.
            </p>
          </div>

          <div className="z-10 mt-auto">
            <h2 className="text-3xl lg:text-4xl  mb-4 leading-tight">
              Capture and share <br /> moments that matter.
            </h2>
            <p className="text-neutral-400 font-medium text-lg">
              Experience a fresh new take on social discovery.
            </p>
          </div>
        </div>

        <div className="md:w-1/2 p-6 lg:p-8 flex flex-col justify-center bg-neutral-900 relative">
          <div className="max-w-md mx-auto w-full">
            <div className="md:hidden text-center mb-4">
              <h1 className="text-4xl font-medium text-white mb-2">
                Best<span className="text-purple-600">gram</span>
              </h1>
              <p className="text-neutral-400 text-sm">
                Sign up to see photos and videos from your friends.
              </p>
            </div>

            <h3 className="text-xl text-white mb-4 hidden md:block">
              Create an account
            </h3>

            <form
              onSubmit={(e) => {
                setError("");
                setSubmitting(true);
                void handleSubmit(e, async (obj) => {
                  try {
                    await handleRegister(obj);
                    navigate("/");
                  } catch (error) {
                    setError(errorMessage(error));
                  } finally {
                    setSubmitting(false);
                  }
                }).catch((requestError) => setError(errorMessage(requestError)));
              }}
              className="space-y-3"
            >
              {/* Username Input */}
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Username"
                  className="peer w-full px-4 pt-6 pb-2 border-2 border-neutral-800 rounded-xl bg-neutral-950 text-white focus:outline-none focus:border-purple-500 focus:bg-neutral-900 transition-all placeholder-transparent"
                  required
                />
                <label
                  htmlFor="username"
                  className="absolute left-4 top-2 text-xs font-semibold text-neutral-500 transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-purple-400"
                >
                  Username
                </label>
              </div>

              {/* Full Name Input */}
              <div className="relative">
                <input
                  type="text"
                  name="fullname"
                  id="fullname"
                  placeholder="Full Name"
                  className="peer w-full px-4 pt-6 pb-2 border-2 border-neutral-800 rounded-xl bg-neutral-950 text-white focus:outline-none focus:border-purple-500 focus:bg-neutral-900 transition-all placeholder-transparent"
                  required
                />
                <label
                  htmlFor="fullname"
                  className="absolute left-4 top-2 text-xs font-semibold text-neutral-500 transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-purple-400"
                >
                  Full Name
                </label>
              </div>

              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Email address"
                  className="peer w-full px-4 pt-6 pb-2 border-2 border-neutral-800 rounded-xl bg-neutral-950 text-white focus:outline-none focus:border-purple-500 focus:bg-neutral-900 transition-all placeholder-transparent"
                  required
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-2 text-xs font-semibold text-neutral-500 transition-all pointer-events-none peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-purple-400"
                >
                  Email address
                </label>
              </div>

              <div className="relative"><input type="tel" name="phone" id="phone" placeholder="Phone number" autoComplete="tel" inputMode="tel" className="peer w-full px-4 pt-6 pb-2 border-2 border-neutral-800 rounded-xl bg-neutral-950 text-white focus:outline-none focus:border-purple-500 focus:bg-neutral-900 transition-all placeholder-transparent" required /><label htmlFor="phone" className="absolute left-4 top-2 text-xs font-semibold text-neutral-500 pointer-events-none">Phone number</label></div>

              <fieldset className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                <legend className="px-1 text-xs font-semibold text-neutral-500">Date of birth</legend>
                <div className="grid grid-cols-3 gap-2">
                  <input name="birthDay" type="number" min="1" max="31" placeholder="Day" required className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-white outline-none focus:border-purple-500" />
                  <select name="birthMonth" defaultValue="" required className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-2.5 text-white outline-none focus:border-purple-500"><option value="" disabled>Month</option>{months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select>
                  <input name="birthYear" type="number" min={new Date().getFullYear() - 120} max={new Date().getFullYear() - 13} placeholder="Year" required className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2.5 text-white outline-none focus:border-purple-500" />
                </div>
              </fieldset>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Password"
                  minLength={6}
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
              <p className="-mt-1 text-xs text-neutral-500">Пароль: минимум 6 символов.</p>
              <input name="adminCode" type="password" placeholder="Admin key (optional)" autoComplete="off" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500" />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="w-full bg-linear-to-bl from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-medium py-3 px-4 rounded-xl shadow-[0_8px_20px_-6px_rgba(168,85,247,0.4)] transform transition-colors duration-300 active:scale-[0.98] cursor-pointer"
                >
                  {submitting ? "Creating account…" : "Sign Up"}
                </button>
              </div>
              {error ? <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}

            </form>

            <div className="mt-4 text-center text-xs text-neutral-500 leading-relaxed">
              By signing up, you agree to our{" "}
              <a
                href="#"
                className="font-semibold text-neutral-400 hover:text-purple-400 transition-colors"
              >
                Terms
              </a>
              ,{" "}
              <a
                href="#"
                className="font-semibold text-neutral-400 hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="font-semibold text-neutral-400 hover:text-purple-400 transition-colors"
              >
                Cookies Policy
              </a>
              .
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800 text-center">
              <p className="text-neutral-400 text-sm font-medium">
                Have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 hover:opacity-80 transition-opacity"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
