import { signIn } from "@/../../auth";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        // await signIn("kakao");
        // await signIn();
        await signIn("google");
      }}
    >
      <button type="submit">Signin with Google</button>
      {/* <button type="submit">Signin with Kakao</button> */}
    </form>
  );
}
