// DashboardPage.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import cookies from "js-cookie";

import Dashboard from "../components/Dashboard";
import Layout from "../components/Layout";
import { jwtDecode } from "jwt-decode";

export default function DashboardPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = cookies.get("token");

    if (!token || token === "undefined" || token === "null") {
      console.log("Aucun token trouvé ou token invalide.");
      cookies.remove("token");
      router.push("/"); // Redirige vers la page de connexion
      return;
    }

    try {
      const decodedToken = jwtDecode(token); // Décoder le token
      console.log("Token décodé :", decodedToken);

      // Vérifier si l'utilisateur a le rôle de responsableFiliere
      if (decodedToken.role !== "responsableFiliere" && 
        decodedToken.role !== "etudiant" && 
        decodedToken.role !== "tuteur" && 
        decodedToken.role !== "encadrant") {
        // Code à exécuter si le rôle n'est pas l'un de ceux mentionnés
      


            console.log("Accès refusé : rôle non autorisé.");
        cookies.remove("token");
        router.push("/"); // Redirige vers la page de connexion
        return;
      }

      console.log("Accès autorisé : utilisateur responsableFiliere.");
      setIsAuthorized(true);
    } catch (error) {
      console.log("Erreur lors du décodage du token :", error);
      cookies.remove("token");
      router.push("/"); // Redirige vers la page de connexion
    }
  }, [router]);

  if (!isAuthorized) {
    return null; // Empêche l'affichage du contenu pendant la redirection
  }
  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">GESTION DE PFE</h1>
        <Dashboard />
      </div>
    </Layout>
  );
}