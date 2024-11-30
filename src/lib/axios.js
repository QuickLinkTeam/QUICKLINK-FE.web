import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL; // .env 파일에서 BASE_URL 설정

const instance = axios.create({
  baseURL: `${BASE_URL}`, // http://<IP주소>/api
  withCredentials: true,  // 쿠키 전송을 위해 추가(세션)
});

// 요청 인터셉터: Authorization 헤더에 Bearer 토큰 추가
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // 저장된 accessToken 가져오기

    // 특정 경로(API 요청)에서 Authorization 헤더 제거
    const excludedEndpoints = ["https://api.imgbb.com/1/upload"]; // Authorization 헤더를 제외할 URL 목록
    const isExcluded = excludedEndpoints.some((endpoint) =>
      config.url.includes(endpoint)
    );

    if (token && !isExcluded) {
      config.headers.Authorization = `Bearer ${token}`; // Bearer 인증 헤더 추가
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 토큰 만료 시 갱신 처리
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken"); // refreshToken 가져오기
        const { data } = await instance.get("/auth/refresh", {
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        localStorage.setItem("accessToken", data.accessToken); // 새로운 accessToken 저장
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`; // 갱신된 토큰으로 요청 재시도
        return instance(originalRequest);
      } catch (refreshError) {
        console.error("토큰 갱신 실패:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
