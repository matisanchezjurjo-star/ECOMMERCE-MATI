import Link from "next/link";
import { Suspense } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleAuthEnabled } from "@/auth";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Bienvenido de nuevo</CardTitle>
        <CardDescription>Iniciá sesión en tu espacio de trabajo de Cumbre.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Suspense>
          <LoginForm googleEnabled={isGoogleAuthEnabled} />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          ¿No tenés una cuenta?{" "}
          <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
            Registrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
