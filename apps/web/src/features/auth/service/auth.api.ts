import axios from "axios";

export async function register({ username, email, phone, fullname, fullName, dateOfBirth, birthDay, birthMonth, birthYear, password, adminCode }) {
  const birthDate = dateOfBirth || (birthYear && birthMonth && birthDay ? `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}` : "");
  const response = await axios.post(
    "/api/auth/register",
    {
      username,
      email,
      phone,
      fullName: fullName || fullname,
      dateOfBirth: birthDate,
      password,
      adminCode,
    },
    { withCredentials: true },
  );
  return response.data;
}

export async function login({ usernameOrEmail, password }) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isEmail = emailRegex.test(usernameOrEmail);

  const response = await axios.post(
    "/api/auth/login",
    {
      [isEmail ? "email" : "username"]: usernameOrEmail,
      password,
    },
    { withCredentials: true },
  );
  return response.data;
}

export async function getMe() {
  const response = await axios.get("/api/auth/me", {
    withCredentials: true,
  });
  return response.data;
}

export async function logout() {
  const response = await axios.post(
    "/api/auth/logout",
    {},
    { withCredentials: true }
  );
  return response.data;
}
