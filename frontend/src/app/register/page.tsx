"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const validate = (): string[] => {
    const newErrors: string[] = [];

    if (name.trim().length < 2) {
      newErrors.push("Ім'я повинно містити мінімум 2 символи");
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.push("Невірний формат email");
    }

    if (password.length < 8) {
      newErrors.push("Пароль повинен містити мінімум 8 символів");
    }

    if (!/[A-Z]/.test(password)) {
      newErrors.push("Пароль повинен містити велику літеру");
    }

    if (!/[a-z]/.test(password)) {
      newErrors.push("Пароль повинен містити малу літеру");
    }

    if (!/[0-9]/.test(password)) {
      newErrors.push("Пароль повинен містити цифру");
    }

    if (password !== confirmPassword) {
      newErrors.push("Паролі не співпадають");
    }

    return newErrors;
  };

  const handleRegister = async () => {
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Помилка реєстрації");
      }

      alert("✅ Реєстрація успішна! Тепер ви можете увійти");
      router.push("/login");
    } catch (err: any) {
      setErrors([err.message]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">Реєстрація</h1>
          <p className="text-sm text-gray-500">Створіть акаунт вчителя</p>
        </div>

        {/* Помилки */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-1">
            {errors.map((err, i) => (
              <p
                key={i}
                className="text-sm text-red-600 flex items-start gap-2"
              >
                <span className="text-red-400">•</span>
                <span>{err}</span>
              </p>
            ))}
          </div>
        )}

        {/* Форма */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ім'я *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Іван Петренко"
              disabled={loading}
              className="w-full border rounded-lg p-3 focus:outline-none 
                         focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50
                         disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              disabled={loading}
              className="w-full border rounded-lg p-3 focus:outline-none 
                         focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50
                         disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Мінімум 8 символів"
              disabled={loading}
              className="w-full border rounded-lg p-3 focus:outline-none 
                         focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50
                         disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Має містити велику літеру, малу літеру та цифру
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Підтвердіть пароль *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторіть пароль"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleRegister();
                }
              }}
              className="w-full border rounded-lg p-3 focus:outline-none 
                         focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50
                         disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Кнопка реєстрації */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium
                     hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed
                     transition"
        >
          {loading ? "Реєстрація..." : "Зареєструватись"}
        </button>

        {/* Посилання на логін */}
        <p className="text-center text-sm text-gray-500">
          Вже є акаунт?{" "}
          <Link
            href="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}
