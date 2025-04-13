"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import cookies from "js-cookie";

axios.interceptors.request.use((config) => {
  const token = cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email et mot de passe sont obligatoires");
      return;
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/login", { email, password });
      
      cookies.set("token", data.token, {
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: 1
      });

      setTimeout(() => {
        switch (data.user.role) {
          case "etudiant":
            router.push(`/users/Etinterface/${data.user.user_id}`);
            break;
          case "tuteur":
            router.push(`/users/Tutinterface/${data.user.user_id}`);
            break;
          case "encadrant":
            router.push(`/users/EncadrantInterface/${data.user.user_id}`);
            break;
          default:
            router.push("/dashboard");
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Identifiants incorrects");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center border-t-4 border-[#b17a56]">
        <div className="flex justify-center  m-2">
          <img
            src="/ESTLOGO.png"
            alt="Logo ESTS"
            className="w-auto h-50 object-contain -mt-3 -mb-2"
         />
        </div>
        
        {error && (
          <p className="text-red-500 text-center mb-2 text-sm bg-red-50 p-2 rounded">
            {error}
          </p>
        )}
        
        <form onSubmit={handleLogin} className="space-y-2">
          <div className="text-left">
            <label className="block text-gray-800 mb-1 text-base font-medium">
              Nom d'Utilisateur :
            </label>
            <input
              type="email"
              placeholder="Entrez votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full p-3 text-base border rounded focus:ring-1 focus:ring-[#1a4edbb2] focus:outline-none border-[#1a4edbb2] bg-white"
              required
            />
          </div>
          <div className="text-left">
            <label className="block text-gray-800 mb-1 text-base font-medium">
              Mot de Passe :
            </label>
            <input
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full p-3 text-base border rounded focus:ring-1 focus:ring-[#1a4edbb2] focus:outline-none border-[#1a4edbb2] bg-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#b17a56] text-white py-3 rounded font-medium hover:bg-[#1a4edbb2] transition duration-200"
          >
            Se Connecter
          </button>
        </form>
      </div>
    </div>
  );
}