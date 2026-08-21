"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, LogIn, Mail, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type FormView = AuthMode | "reset";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const isVerified = searchParams.get("verified") === "1";
  const verificationFailed = searchParams.get("verified") === "error";
  const passwordUpdated = searchParams.get("password") === "updated";
  const redirectPath =
    redirectedFrom?.startsWith("/") && !redirectedFrom.startsWith("//")
      ? redirectedFrom
      : "/plans";
  const [mode, setMode] = useState<FormView>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();

    if (mode === "reset") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/reset-password`
              : undefined,
        },
      );

      setIsSubmitting(false);

      if (resetError) {
        setError("No pudimos enviar el correo de recuperacion.");
        return;
      }

      setMessage("Te enviamos un enlace para cambiar tu contrasena.");
      return;
    }

    if (mode === "login") {
      const cleanUsername = normalizeUsername(username);
      const { data: authEmail, error: usernameError } = await supabase.rpc(
        "get_auth_email_by_username",
        {
          p_username: cleanUsername,
        },
      );

      if (usernameError || !authEmail) {
        setIsSubmitting(false);
        setError("Usuario o contrasena incorrectos.");
        return;
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      setIsSubmitting(false);

      if (authError) {
        setError("Usuario o contrasena incorrectos.");
        return;
      }

      router.push(redirectPath);
      router.refresh();
      return;
    }

    const cleanUsername = normalizeUsername(username);
    const emailRedirectTo =
      typeof window !== "undefined"
        ? (() => {
            const callbackUrl = new URL("/auth/callback", window.location.origin);
            callbackUrl.searchParams.set("next", "/auth?verified=1");
            return callbackUrl.toString();
          })()
        : undefined;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
        data: {
          name,
          username: cleanUsername,
        },
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Cuenta creada. Revisa tu correo para verificarla.");
    setMode("login");
  }

  if (isVerified) {
    return (
      <div className="space-y-5">
        <div className="rounded-[22px] border border-[#c7e7d4] bg-[#f1fbf5] p-5 text-center dark:border-[#3b82f6] dark:bg-[#1e3a5f]">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#1f6a3d] text-white dark:bg-[#bfdbfe] dark:text-[#0f172a]">
            <CheckCircle2 size={24} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-[#17201a] dark:text-[#f8fbff]">
            Verificacion exitosa
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#4d5b50] dark:text-[#dbe7f6]">
            Tu cuenta quedo activa. Ya puedes continuar a tu calendario de
            entrenamientos.
          </p>
        </div>
        <Button
          type="button"
          className="w-full"
          onClick={() => {
            router.push("/plans");
            router.refresh();
          }}
        >
          Ir al calendario
        </Button>
      </div>
    );
  }

  if (verificationFailed) {
    return (
      <div className="space-y-5">
        <StatusMessage type="error">
          No pudimos verificar la cuenta con este enlace. Solicita uno nuevo o
          intenta iniciar sesion si ya fue verificada.
        </StatusMessage>
        <Button
          type="button"
          className="w-full"
          onClick={() => {
            router.replace("/auth");
            setMode("login");
          }}
        >
          Volver a iniciar sesion
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "signup" ? (
        <Field
          id="name"
          label="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tu nombre"
          autoComplete="name"
        />
      ) : null}

      {mode === "login" || mode === "signup" ? (
        <Field
          id="username"
          label="Usuario"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="miusuario"
          autoComplete="username"
          pattern="[A-Za-z0-9_.-]{3,30}"
          title="Usa entre 3 y 30 caracteres: letras, numeros, punto, guion o guion bajo."
          required
        />
      ) : null}

      {mode === "signup" || mode === "reset" ? (
        <Field
          id="email"
          label={mode === "reset" ? "Correo para recuperar contrasena" : "Correo"}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
          type="email"
          autoComplete="email"
          required
        />
      ) : null}

      {mode !== "reset" ? (
        <Field
          id="password"
          label="Contrasena"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimo 6 caracteres"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          required
        />
      ) : null}

      {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
      {passwordUpdated ? (
        <StatusMessage type="success">
          Contrasena actualizada. Ya puedes iniciar sesion.
        </StatusMessage>
      ) : null}
      {message ? <StatusMessage type="success">{message}</StatusMessage> : null}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
        icon={
          mode === "login" ? (
            <LogIn size={18} />
          ) : mode === "reset" ? (
            <Mail size={18} />
          ) : (
            <UserPlus size={18} />
          )
        }
      >
        {isSubmitting
          ? "Procesando..."
          : mode === "reset"
            ? "Enviar enlace"
            : mode === "login"
              ? "Iniciar sesion"
              : "Crear cuenta"}
      </Button>

      {mode === "login" ? (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setMessage(null);
            setMode("reset");
          }}
          className="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-[#4d5b50] transition hover:bg-[#eef3ef] dark:text-[#dbe7f6] dark:hover:bg-[#22314a]"
        >
          Cambiar o recuperar contrasena
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setError(null);
          setMessage(null);
          setMode(mode === "login" ? "signup" : "login");
        }}
        className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-[#4d5b50] transition hover:bg-[#eef3ef] dark:text-[#dbe7f6] dark:hover:bg-[#22314a]"
      >
        {mode === "login"
          ? "Crear cuenta nueva"
          : "Volver a iniciar sesion"}
      </button>
    </form>
  );
}
