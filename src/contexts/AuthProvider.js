import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";

const AuthContext = createContext({
  user: null,
  isPending: true,
  login: () => {},
  logout: () => {},
  updateMe: () => {},
  kakaoLogin: () => {},      // 카카오 로그인
  refreshToken: () => {},    // 토큰 재발급 함수
});

export function AuthProvider({ children }) {
  const [values, setValues] = useState({
    user: null,
    isPending: true,
  });

  async function getMe() {
    setValues((prevValues) => ({
      ...prevValues,
      isPending: true,
    }));
    let nextUser;
    try {
      const res = await axios.get("/api/member");
      // 서버에서 name, email 등을 반환해줘야 함.
      nextUser = res.data;
    } finally {
      setValues((prevValues) => ({
        ...prevValues,
        user: nextUser,
        isPending: false,
      }));
    }
  }

  async function login({ email, password }) {
    await axios.post("/api/auth/login", {
      email,
      password,
    });
    await getMe();
  }

  async function kakaoLogin() {
    // 카카오 로그인 URL로 redirect
    window.location.href = "/oauth2/authorization/kakao";
  }

  // 카카오 인증 결과 처리
  async function handleKakaoRedirect() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const authCode = urlParams.get("code");

    if (!authCode) {
      console.error("카카오 인증 코드가 없습니다.");
      return;
    }

    try {
      // 백엔드로 인증 코드 전달
      const res = await axios.get(`/api/auth/kakao/callback?code=${authCode}`);
      const { token, user } =  res.data;

      localStorage.setItem("token", token);

      // 사용자 정보 업데이트
      setValues({
        user: user,
        isPending: false,
      });
    } catch (error) {
      console.error("카카오 인증 실패", error);
    }
  }



  async function refreshToken() {
    try {
      const res = await axios.get("/api/auth/refresh", { withCredentials: true });
      const newToken = res.data.token;
      localStorage.setItem("token", newToken);    // 새로운 토큰 로컬에 저장
      await getMe();    // 새 토큰으로 사용자 정보 불러오기
    } catch (error) {
      console.error("Failed to refresh token: ", error);
      logout();    // 재발급 실패하면 로그아웃
    }
  }

  async function logout() {
    try {
      localStorage.removeItem("token");
    } finally {
      setValues({
        user: null,
        isPending: false,
      });
    }
  }

  async function updateMe(formData) {
    const res = await axios.put("/api/member", formData);
    const nextUser = res.data;
    setValues((prevValues) => ({
      ...prevValues,
      user: nextUser,
    }));
  }

  useEffect(() => {
    getMe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: values.user,
        isPending: values.isPending,
        login,
        logout,
        updateMe,
        kakaoLogin,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(required) {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error("반드시 AuthProvider 안에서 사용해야 합니다.");
  }

  useEffect(() => {
    if (required && !context.user && !context.isPending) {
      navigate("/login");
    }
  }, [context.user, context.isPending, navigate, required]);

  return context;
}