"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, LogIn, Mail, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type FormView = AuthMode | "reset" | "update-password";

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom");
  const redirectPath =
    redirectedFrom?.startsWith("/") && !redirectedFrom.startsWith("//")
      ? redirectedFrom
      : "/calendar";
  const [mode, setMode] = useState<FormView>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update-password");
        setMessage("Ingresa tu nueva contrasena.");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();

    if (mode === "update-password") {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      setIsSubmitting(false);

      if (updateError) {
        setError("No pudimos cambiar tu contrasena.");
        return;
      }

      await supabase.auth.signOut();
      setMessage("Contrasena actualizada. Ya puedes entrar.");
      setPassword("");
      setMode("login");
      return;
    }

    if (mode === "reset") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth`
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

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
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

    setMessage("Cuenta creada. Ya puedes iniciar sesion con tu usuario.");
    setMode("login");
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
          label="Correo para recuperar contrasena"
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
          label={mode === "update-password" ? "Nueva contrasena" : "Contrasena"}
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
          ) : mode === "update-password" ? (
            <KeyRound size={18} />
          ) : (
            <UserPlus size={18} />
          )
        }
      >
        {isSubmitting
          ? "Procesando..."
          : mode === "reset"
            ? "Enviar enlace"
            : mode === "update-password"
              ? "Cambiar contrasena"
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
          className="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-[#4d5b50] transition hover:bg-[#eef3ef]"
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
        className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-[#4d5b50] transition hover:bg-[#eef3ef]"
      >
        {mode === "login"
          ? "Crear cuenta nueva"
          : "Volver a iniciar sesion"}
      </button>
    </form>
  );
}
