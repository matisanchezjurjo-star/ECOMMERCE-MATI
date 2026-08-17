import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Creá tu cuenta</CardTitle>
        <CardDescription>Empezá a descubrir productos ganadores en minutos.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tenés una cuenta?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Iniciá sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
