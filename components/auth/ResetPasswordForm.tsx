"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { StatusMessage } from "@/components/ui/StatusMessage";
import { createClient } from "@/lib/supabase/client";

type ResetState = "checking" | "ready" | "invalid" | "saved";

function getRecoveryError(searchParams: { get: (name: string) => string | null }) {
  if (searchParams.get("error") || searchParams.get("error_code")) {
    return true;
  }

  if (typeof window === "undefined" || !window.location.hash) {
    return false;
  }

  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  return Boolean(hashParams.get("error") || hashParams.get("error_code"));
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ResetState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    async function prepareRecoverySession() {
      setError(null);

      if (getRecoveryError(searchParams)) {
        setState("invalid");
        setError("Este enlace de recuperacion expiro, es invalido o ya fue utilizado.");
        return;
      }

      const code = searchParams.get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (!isMounted) {
          return;
        }

        if (exchangeError) {
          setState("invalid");
          setError("Este enlace de recuperacion expiro, es invalido o ya fue utilizado.");
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (session) {
        setState("ready");
        return;
      }

      setState("invalid");
      setError("Este enlace de recuperacion expiro, es invalido o ya fue utilizado.");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setState("ready");
        setError(null);
      }
    });

    void prepareRecoverySession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [searchParams, supabase]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setIsSubmitting(false);
      setState("invalid");
      setError("No pudimos cambiar la contrasena con este enlace. Solicita uno nuevo.");
      return;
    }

    await supabase.auth.signOut();
    setState("saved");
    setMessage("Contrasena actualizada. Te llevaremos al login.");
    setPassword("");
    setConfirmPassword("");
    setIsSubmitting(false);

    window.setTimeout(() => {
      router.replace("/auth?password=updated");
      router.refresh();
    }, 1400);
  }

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

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
      setError("No pudimos enviar otro correo de recuperacion.");
      return;
    }

    setMessage("Te enviamos un nuevo enlace para cambiar tu contrasena.");
  }

  if (state === "checking") {
    return <StatusMessage>Validando enlace de recuperacion...</StatusMessage>;
  }

  if (state === "invalid") {
    return (
      <form onSubmit={handleResend} className="space-y-5">
        {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
        {message ? <StatusMessage type="success">{message}</StatusMessage> : null}
        <Field
          id="recovery-email"
          label="Correo de la cuenta"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          icon={<Mail size={18} aria-hidden="true" />}
        >
          {isSubmitting ? "Enviando..." : "Solicitar nuevo correo"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => router.replace("/auth")}
        >
          Volver al login
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {message ? <StatusMessage type="success">{message}</StatusMessage> : null}
      {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
      <Field
        id="new-password"
        label="Nueva contrasena"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        type="password"
        autoComplete="new-password"
        minLength={6}
        placeholder="Minimo 6 caracteres"
        required
        disabled={state === "saved"}
      />
      <Field
        id="confirm-password"
        label="Confirmar nueva contrasena"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        type="password"
        autoComplete="new-password"
        minLength={6}
        placeholder="Repite la contrasena"
        required
        disabled={state === "saved"}
      />
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || state === "saved"}
        icon={<KeyRound size={18} aria-hidden="true" />}
      >
        {isSubmitting ? "Guardando..." : "Guardar contrasena"}
      </Button>
    </form>
  );
}
