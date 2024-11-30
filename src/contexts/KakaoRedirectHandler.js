// src/contexts/KakaoRedirectHandler.js
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../lib/axios";
import { useAuth } from "../contexts/AuthProvider";

function KakaoRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getMe } = useAuth();

  useEffect(() => {
    async function handleKakaoLogin() {
      try {
        // URL에서 'code' 파라미터 추출
        const query = new URLSearchParams(location.search);
        const identifier = query.get("code");
        console.log(identifier);

        if (identifier) {
          // 백엔드로 GET 요청을 보내서 토큰을 받아옴
          const res = await axios.get(`/auth/login/kakao/success?identifier=${identifier}`);
          console.log("카카오 로그인 응답 데이터: ", res.data);

          // 응답 데이터에서 토큰 추출
          const { accessToken, refreshToken } = res.data.result;

          if (accessToken && refreshToken) {
            // 토큰 저장
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            console.log("Access Token 저장:", accessToken);
            console.log("Refresh Token 저장:", refreshToken);

            await getMe();
            navigate("/me");
          } else {
            throw new Error("토큰이 누락되었습니다.");
          }
        } else {
          throw new Error("Authorization code가 없습니다.");
        }
      } catch (error) {
        console.error("카카오 로그인 처리 중 에러 발생:", error);
        alert("로그인에 실패했습니다. 다시 시도해주세요.");
        navigate("/login");
      }
    }

    handleKakaoLogin();
  }, [location, navigate, getMe]);

  return null;
}

export default KakaoRedirectHandler;
