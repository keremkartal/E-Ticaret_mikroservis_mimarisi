// frontend/src/pages/ForceChangePassword.tsx
import React from "react"; // React importu eklendi
import { useAuth } from "../auth/AuthContext"; // AuthContext'ten useAuth'u import et
import { Navigate } from "react-router-dom";
// ChangePasswordForm gibi bir form bileşeniniz olduğunu varsayalım
// import ChangePasswordForm from "../components/ChangePasswordForm"; 

export default function ForceChangePassword() {
  const { user, token } = useAuth(); // user objesini ve token'ı context'ten al

  // Eğer kullanıcı yoksa (giriş yapılmamışsa) veya token yoksa login'e yönlendir
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Kullanıcının şifresini değiştirmesi gerekmiyorsa (must_change !== 2) ana sayfaya yönlendir.
  // (must_change === 2 durumu, geçici şifreyle giriş yapıldığını ve şifrenin değiştirilmesi gerektiğini belirtir)
  if (user.must_change !== 2) {
    // Eğer kullanıcı şifresini zaten değiştirdiyse veya değiştirmesi gerekmiyorsa
    // ana sayfaya veya profiline yönlendirilebilir.
    return <Navigate to="/" replace />;
  }

  // Şifre değiştirme formunu burada gösterin
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Şifrenizi Güncelleyin</h2>
              <p className="text-center text-muted">
                Güvenliğiniz için, size atanan geçici şifreyi yeni bir şifre ile güncellemeniz gerekmektedir.
              </p>
              {/* Buraya şifre değiştirme formunuzu ekleyin.
                Bu form genellikle eski şifre (geçici şifre), yeni şifre ve yeni şifre tekrarı alanlarını içerir.
                Form submit edildiğinde, backend'deki şifre güncelleme endpoint'ine istek gönderir.
                (Örn: userService.changePassword({ old_password: temporaryPassword, new_password: newPassword }))
                Başarılı olursa, kullanıcıyı login sayfasına veya ana sayfaya yönlendirebilirsiniz.
              */}
              {/* Örnek: <ChangePasswordForm initialOldPassword={promptedTemporaryPassword} /> */}
              <p className="text-center mt-3">
                (Şifre değiştirme formu buraya gelecek)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
