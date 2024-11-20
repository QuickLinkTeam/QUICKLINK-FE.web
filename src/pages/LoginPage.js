import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Label from "../components/Label";
import Input from "../components/Input";
import Button from "../components/Button";
import HorizontalRule from "../components/HorizontalRule";
import Link from "../components/Link";
import KakaoImage from "../assets/kakao.svg";
import styles from "./LoginPage.module.css";
import { useAuth } from "../contexts/AuthProvider";

function LoginPage() {
  const [values, setValues] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { user, login, kakaoLogin, handleKakaoRedirect, getMe } = useAuth();

  function handleChange(e) {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { email, password } = values;

    try {
      await login({ email, password });
      navigate('/me');
    } catch (error) {
      console.error("로그인 실패", error);
      alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    }
  }

  useEffect(() => {
    if (user) {
      navigate('/me');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (window.location.pathname === "/login/oauth2/code/kakao") {
      handleKakaoRedirect();
    } else {
      getMe();
    }
  }, []);

  return (
    <>
      <h1 className={styles.Heading}>로그인</h1>
      <form className={styles.Form} onSubmit={handleSubmit}>
        <Label className={styles.Label} htmlFor="email">
          이메일
        </Label>
        <Input
          id="email"
          className={styles.Input}
          name="email"
          type="email"
          placeholder="이메일"
          value={values.email}
          onChange={handleChange}
        />
        <Label className={styles.Label} htmlFor="password">
          비밀번호
        </Label>
        <Input
          id="password"
          className={styles.Input}
          name="password"
          type="password"
          placeholder="비밀번호"
          value={values.password}
          onChange={handleChange}
        />
        <Button className={styles.Button}>로그인</Button>
        <HorizontalRule className={styles.HorizontalRule}>또는</HorizontalRule>
        <Button
          className={styles.KakaoButton}
          type="button"
          appearance="outline"
          as={Link}
          /** @TODO 카카오 로그인 구현 */
          onClick={kakaoLogin}
        >
          <img src={KakaoImage} alt="Kakao" />
          카카오로 시작하기
        </Button>
        <div>
          회원이 아니신가요? <Link to="/register">회원가입하기</Link>
        </div>
      </form>
    </>
  );
}

export default LoginPage;
