import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import Label from "../components/Label";
import Input from "../components/Input";
import Button from "../components/Button";
import HorizontalRule from "../components/HorizontalRule";
import Link from "../components/Link";
import KakaoImage from "../assets/kakao.svg";
import styles from "./RegisterPage.module.css";
import { useToaster } from "../contexts/ToasterProvider";
import { useAuth } from "../contexts/AuthProvider";

function RegisterPage() {
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    passwordRepeat: "",
  });
  const navigate = useNavigate();
  const toast = useToaster();
  const { user, login } = useAuth(); // 'user'를 여기서 가져옴

  function handleChange(e) {
    const { name, value } = e.target;

    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (values.password !== values.passwordRepeat) {
      toast("warn", "비밀번호가 일치하지 않습니다.");
      return;
    }

    const { username, email, password } = values;

    try {
      // 회원가입 API 호출
      await axios.post("/auth/signup", {
        username,
        email,
        password,
      });

      toast("success", "회원가입이 완료되었습니다.");
      navigate("/login"); // 회원가입 성공 후 로그인 페이지로 이동
    } catch (error) {
      console.error("회원가입 실패:", error);
      toast("error", "회원가입 중 문제가 발생했습니다.");
    }
  }

  useEffect(() => {
    // 현재 사용자가 로그인되어 있으면 /me로 리다이렉트
    if (user) {
      navigate("/me");
    }
  }, [user, navigate]);

  return (
    <>
      <h1 className={styles.Heading}>회원가입</h1>
        <Button
        className={styles.KakaoButton}
        type="button"
        appearance="outline"
        onClick={() => {
          window.location.href = `${axios.defaults.baseURL}/oauth2/authorization/kakao`;
        }}
      >
        <img src={KakaoImage} alt="Kakao" />
        카카오로 시작하기
      </Button>
      <HorizontalRule className={styles.HorizontalRule}>또는</HorizontalRule>
      <form className={styles.Form} onSubmit={handleSubmit}>
        <Label className={styles.Label} htmlFor="username">
          이름
        </Label>
        <Input
          id="username"
          className={styles.Input}
          name="username"
          type="text"
          placeholder="김링크"
          value={values.username}
          onChange={handleChange}
        />
        <Label className={styles.Label} htmlFor="email">
          이메일
        </Label>
        <Input
          id="email"
          className={styles.Input}
          name="email"
          type="email"
          placeholder="example@email.com"
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
        <Label className={styles.Label} htmlFor="passwordRepeat">
          비밀번호 확인
        </Label>
        <Input
          id="passwordRepeat"
          className={styles.Input}
          name="passwordRepeat"
          type="password"
          placeholder="비밀번호 확인"
          value={values.passwordRepeat}
          onChange={handleChange}
        />
        <Button className={styles.Button}>회원가입</Button>
        <div>
          이미 회원이신가요? <Link to="/login">로그인하기</Link>
        </div>
      </form>
    </>
  );
}

export default RegisterPage;
