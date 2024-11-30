// src/Main.js
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./components/App";
import {
  FullLayout,
  LandingLayout,
  MyPageLayout,
  UserLayout,
} from "./components/Layout";
import HomePage from "./pages/HomePage";
import MyPage from "./pages/MyPage";
import MePage from "./pages/MePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UserPage from "./pages/UserPage";
import SettingPage from "./pages/SettingPage";
import CreateLinkPage from "./pages/CreateLinkPage";
import EditLinkPage from "./pages/EditLinkPage";
import Nav from "./components/Nav";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "./contexts/AuthProvider";
import KakaoRedirectHandler from "./contexts/KakaoRedirectHandler";

function Main() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <BrowserRouter>
      <AuthProvider>
        <App>
          <Nav onSearch={setSearchTerm} />
          <Routes>
            <Route element={<LandingLayout />}>
              <Route index element={<HomePage />} />
            </Route>
            <Route element={<MyPageLayout />}>
              <Route path="me" element={<MyPage searchTerm={searchTerm} />} />
              <Route path="me/info" element={<MePage />} />
            </Route>
            <Route element={<FullLayout />}>
              <Route path="me/info/edit" element={<SettingPage />} />
              <Route path="me/links/create" element={<CreateLinkPage />} />
              <Route path="me/links/:linkId/edit" element={<EditLinkPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              {/* KakaoRedirectHandler를 위한 라우트 추가 */}
              <Route path="oauth/kakao" element={<KakaoRedirectHandler />} />
            </Route>
            <Route element={<UserLayout />}>
              <Route path=":userId" element={<UserPage />} />
            </Route>
          </Routes>
          <BottomNav />
        </App>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default Main;
