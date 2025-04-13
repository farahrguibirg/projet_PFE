"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import cookies from "js-cookie";
import Layout from "../../../components/Layout";

export default function EtudiantInterface() {
  const { user_id } = useParams();
  const [etudiantData, setEtudiantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEtudiantInfo = async () => {
      try {
        const token = cookies.get("token");
        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await axios.get(
          `http://localhost:5000/api/etudiants/${user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.data) {
          throw new Error("Aucune donnée reçue");
        }

        setEtudiantData(response.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des informations :", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erreur lors de la récupération des informations"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user_id) {
      fetchEtudiantInfo();
    } else {
      setError("ID étudiant non fourni");
      setLoading(false);
    }
  }, [user_id]);

  if (loading) {
    return <p className="text-center mt-10 text-[#6e4c34]">Chargement...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center mt-10 bg-red-50 p-3 rounded-lg">{error}</p>;
  }

  if (!etudiantData) {
    return <p className="text-center mt-10 text-[#6e4c34]">Aucune information trouvée.</p>;
  }

  const { nom, prenom, email, annee, classe, filiere, groupe } = etudiantData;

  return (
    <Layout /* title="Profil Étudiant"*/>
      <div className="max-w-full mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-[#d4b9a1]">
        <h1 className="text-3xl font-bold text-center text-[#b17a56] mb-6">
          Profil Étudiant
        </h1>

        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#f8f1ea] p-6 rounded-lg shadow-md border border-[#d4b9a1]">
            <h2 className="text-2xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
              Informations générales
            </h2>
            <div className="space-y-3 text-[#6e4c34]">
              <p><span className="font-medium text-[#b17a56]">Nom :</span> {nom}</p>
              <p><span className="font-medium text-[#b17a56]">Prénom :</span> {prenom}</p>
              <p><span className="font-medium text-[#b17a56]">Email :</span> {email}</p>
              <p><span className="font-medium text-[#b17a56]">Année :</span> {annee}</p>
              <p><span className="font-medium text-[#b17a56]">Classe :</span> {classe}</p>
              <p><span className="font-medium text-[#b17a56]">Filière :</span> {filiere}</p>
            </div>
          </div>

          {/* Informations du groupe */}
          {groupe && (
            <div className="bg-[#f8f1ea] p-6 rounded-lg shadow-md border border-[#d4b9a1]">
              <h2 className="text-2xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
                Informations du groupe
              </h2>
              <div className="space-y-3 text-[#6e4c34]">
                <p><span className="font-medium text-[#b17a56]">Nom du groupe :</span> {groupe.nomGroupe}</p>

                {/* Tuteur */}
                {groupe.tuteur ? (
                  <div className="mt-4 pt-4 border-t border-[#d4b9a1]">
                    <h3 className="text-lg font-semibold text-[#b17a56]">Tuteur</h3>
                    <p><span className="font-medium">Nom :</span> {groupe.tuteur.nom}</p>
                    <p><span className="font-medium">Prénom :</span> {groupe.tuteur.prenom}</p>
                  </div>
                ) : (
                  <p className="text-[#6e4c34]">Aucun tuteur assigné.</p>
                )}
                {/* Sujet et Encadrant */}
                {groupe.sujet ? (
                  <div className="mt-4 pt-4 border-t border-[#d4b9a1]">
                    <h3 className="text-lg font-semibold text-[#b17a56]">Sujet</h3>
                    <p><span className="font-medium">Titre :</span> {groupe.sujet.titre}</p>
                    
                    {/* Encadrant - maintenant à l'intérieur du bloc sujet */}
                    {groupe.sujet.encadrant ? (
      <div className="mt-4 pt-2 border-t border-[#d4b9a1]">
        <h3 className="text-lg font-semibold text-[#b17a56]">Encadrant</h3>
        <p><span className="font-medium">Nom :</span> {groupe.sujet.encadrant.nom}</p>
        <p><span className="font-medium">Prénom :</span> {groupe.sujet.encadrant.prenom}</p>
                      </div>
                    ) : (
                      <p className="text-[#6e4c34] mt-2">Aucun encadrant assigné.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-[#6e4c34]">Aucun sujet assigné.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Étudiants du groupe */}
        {groupe && groupe.etudiants && groupe.etudiants.length > 0 ? (
          <div className="bg-[#f8f1ea] p-6 rounded-lg shadow-md mb-8 border border-[#d4b9a1]">
            <h2 className="text-2xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
              Étudiants du groupe
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupe.etudiants.map((etudiantGroupe, index) => (
                <li 
                  key={index} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-[#d4b9a1] hover:shadow-md transition-shadow"
                >
                  <p className="text-[#6e4c34]">
                    <span className="font-medium text-[#b17a56]">Nom :</span> {etudiantGroupe.nom} {etudiantGroupe.prenom}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[#6e4c34] text-center">Aucun étudiant dans ce groupe.</p>
        )}
      </div>
    </Layout>
  );
}