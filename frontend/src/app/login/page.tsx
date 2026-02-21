"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold">Вхід для вчителя</h1>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Увійти через Google
        </button>

        <hr />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          onClick={() =>
            signIn("credentials", {
              email,
              password,
              callbackUrl: "/dashboard",
            })
          }
          className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Увійти
        </button>

        <p className="text-center text-sm">
          Немає акаунту?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Зареєструватись
          </a>
        </p>
      </div>
    </div>
  );
}
