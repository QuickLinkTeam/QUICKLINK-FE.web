import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios"; // 수정된 axios 인스턴스

const AuthContext = createContext({
  user: null,
  isPending: true,
  login: () => {},
  signup: () => {},
  logout: () => {},
  updateMe: () => {}, // 추가
  setTokens: () => {},
});

export function AuthProvider({ children }) {
  const [values, setValues] = useState({
    user: null,
    isPending: true,
  });

  const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate 사용

  // 사용자 정보 가져오기
  async function getMe() {
    setValues((prevValues) => ({
      ...prevValues,
      isPending: true,
    }));

    try {
      const token = localStorage.getItem("accessToken"); // 토큰 가져오기
      if (!token) throw new Error("AccessToken이 없습니다.");

      const res = await axios.get("/member", {
        headers: {
          Authorization: `Bearer ${token}`, // Authorization 헤더 추가
        },
      });

      const user = res.data.result;

      setValues((prevValues) => ({
        ...prevValues,
        user,
        isPending: false,
      }));
    } catch (error) {
      console.error("사용자 정보 가져오기 실패:", error);
      setValues((prevValues) => ({
        ...prevValues,
        isPending: false,
      }));
    }
  }

  // 로그인
  async function login({ email, password }) {
    try {
      const res = await axios.post("/auth/login", { email, password });

      // 응답 데이터 확인
      const { accessToken, refreshToken } = res.data.result;

      // 토큰 저장
      if (accessToken && refreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        console.log("Access Token 저장:", accessToken);
        console.log("Refresh Token 저장:", refreshToken);
      } else {
        throw new Error("AccessToken 또는 RefreshToken이 누락되었습니다.");
      }

      await getMe();

      navigate("/me");
    } catch (error) {
      console.error("로그인 실패:", error.response?.data || error.message);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  }

  // 회원가입
  async function signup({ email, password }) {
    try {
      await axios.post("/auth/signup", { email, password });
      navigate("/login"); // 회원가입 성공 시 /login 페이지로 이동
    } catch (error) {
      console.error("회원가입 실패:", error);
      throw error;
    }
  }

  // 로그아웃
  async function logout() {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setValues({
        user: null,
        isPending: false,
      });

      navigate("/"); // 로그아웃 후 / 페이지로 이동
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  }

  // 사용자 정보 업데이트
  async function updateMe(formData) {
    try {
      const token = localStorage.getItem("accessToken"); // 토큰 가져오기
      if (!token) throw new Error("AccessToken이 없습니다.");

      const res = await axios.put("/member", formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Authorization 헤더 추가
        },
      }); // PUT /api/member 사용
      const updatedUser = res.data.result;

      setValues((prevValues) => ({
        ...prevValues,
        user: updatedUser, // 업데이트된 사용자 정보 설정
      }));
    } catch (error) {
      console.error("사용자 정보 업데이트 실패:", error);
      throw error;
    }
  }

  // 토큰 설정 메소드 추가
  function setTokens({ accessToken, refreshToken }) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  useEffect(() => {
    getMe(); // 초기 로드 시 사용자 정보 가져오기
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: values.user,
        isPending: values.isPending,
        login,
        signup,
        logout,
        updateMe, // 추가
        setTokens, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthProvider 내에서만 useAuth를 사용할 수 있습니다.");
  }

  return context;
}
