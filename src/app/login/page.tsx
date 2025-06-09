import { auth } from "@/shared/lib/auth";

const LoginPage = async () => {
  const session = await auth();
  console.log(session, "session");
  return <div>LoginPage</div>;
};

export default LoginPage;
