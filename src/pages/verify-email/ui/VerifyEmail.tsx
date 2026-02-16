import {Navigate, useSearchParams} from 'react-router-dom';
import {useEffect} from "react";
import {useAuthStore} from "@/features/auth";
import {ROUTES} from "@/shared";

export function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { isEmailVerified, verifyEmail } = useAuthStore();


  useEffect(() => {
    if(token){
      void verifyEmail({token})
    }
  }, [token,verifyEmail]);

  if (isEmailVerified) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
  );
}
