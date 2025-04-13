/*"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import cookies from "js-cookie";
import Layout from "../../../components/Layout";

export default function TuteurInterface() {
  const { user_id } = useParams();
  const [tuteurData, setTuteurData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTuteurInfo = async () => {
      try {
        const token = cookies.get("token");
        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await axios.get(
          `http://localhost:5000/api/tuteurs/${user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.data) {
          throw new Error("Aucune donnée reçue");
        }

        setTuteurData(response.data);
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
      fetchTuteurInfo();
    } else {
      setError("ID tuteur non fourni");
      setLoading(false);
    }
  }, [user_id]);

  if (loading) {
    return <p className="text-center mt-10 text-[#6e4c34]">Chargement...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center mt-10 bg-red-50 p-3 rounded-lg">{error}</p>;
  }

  if (!tuteurData) {
    return <p className="text-center mt-10 text-[#6e4c34]">Aucune information trouvée.</p>;
  }

  const { nom, prenom, email, groupe } = tuteurData;

  return (
    <Layout/* title="Profil Tuteur"
      <div className="max-w-full mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-[#d4b9a1]">
        <h1 className="text-3xl font-bold text-center text-[#b17a56] mb-6">
          Profil Tuteur
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#f8f1ea] p-6 rounded-lg shadow-md border border-[#d4b9a1]">
            <h2 className="text-2xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
              Informations générales
            </h2>
            <div className="space-y-3 text-[#6e4c34]">
              <p><span className="font-medium">Nom :</span> {nom}</p>
              <p><span className="font-medium">Prénom :</span> {prenom}</p>
              <p><span className="font-medium">Email :</span> {email}</p>
              <p><span className="font-medium">ID Tuteur :</span> {tuteurData.idTuteur}</p>
            </div>
          </div>

       
          {groupe && (
            <div className="bg-[#f8f1ea] p-6 rounded-lg shadow-md border border-[#d4b9a1]">
              <h2 className="text-2xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
                Informations du groupe
              </h2>
              <div className="space-y-3 text-[#6e4c34]">
                <p><span className="font-medium">ID du groupe :</span> {groupe.idGroupe}</p>
                <p><span className="font-medium">Nom du groupe :</span> {groupe.nomGroupe}</p>

             
                {groupe.sujet && (
                  <div className="mt-4 pt-4 border-t border-[#d4b9a1]">
                    <h3 className="text-lg font-semibold text-[#b17a56]">Sujet</h3>
                    <p><span className="font-medium">ID du sujet :</span> {groupe.sujet.idSujet}</p>
                    <p><span className="font-medium">Titre :</span> {groupe.sujet.titre}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

       
        {groupe && groupe.etudiants && groupe.etudiants.length > 0 && (
          <div className="bg-[#f8f1ea] p-6 rounded-lg shadow-md mb-8 border border-[#d4b9a1]">
            <h2 className="text-2xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
              Étudiants du groupe
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupe.etudiants.map((etudiant, index) => (
                <li 
                  key={index} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-[#d4b9a1] hover:shadow-md transition-shadow"
                >
                  <p className="text-[#6e4c34]"><span className="font-medium text-[#b17a56]">Nom :</span> {etudiant.nom} {etudiant.prenom}</p>
                  <p className="text-[#6e4c34]"><span className="font-medium text-[#b17a56]">ID Étudiant :</span> {etudiant.idEtudiant}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}*/
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import cookies from "js-cookie";
import Layout from "../../../components/Layout";

export default function TuteurInterface() {
  const { user_id } = useParams();
  const [tuteurData, setTuteurData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTuteurInfo = async () => {
      try {
        const token = cookies.get("token");
        if (!token) {
          throw new Error("Non authentifié");
        }

        const response = await axios.get(
          `http://localhost:5000/api/tuteurs/${user_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.data) {
          throw new Error("Aucune donnée reçue");
        }

        setTuteurData(response.data);
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
      fetchTuteurInfo();
    } else {
      setError("ID tuteur non fourni");
      setLoading(false);
    }
  }, [user_id]);

  if (loading) {
    return <p className="text-center mt-10 text-[#6e4c34]">Chargement...</p>;
  }

  if (error) {
    return <p className="text-red-600 text-center mt-10 bg-red-50 p-3 rounded-lg">{error}</p>;
  }

  if (!tuteurData) {
    return <p className="text-center mt-10 text-[#6e4c34]">Aucune information trouvée.</p>;
  }

  const { nom, prenom, email, groupe } = tuteurData;

  return (
    <Layout>
      <div className="max-w-full mx-auto p-6 bg-white shadow-2xl rounded-2xl border border-[#d4b9a1]">
        <h1 className="text-3xl font-bold text-center text-[#b17a56] mb-6">
          Profil Tuteur
        </h1>

        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#f8f1ea] p-6 rounded-lg shadow-md border border-[#d4b9a1]">
            <h2 className="text-2xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
              Informations générales
            </h2>
            <div className="space-y-3 text-[#6e4c34]">
              <p><span className="font-medium">Nom :</span> {nom}</p>
              <p><span className="font-medium">Prénom :</span> {prenom}</p>
              <p><span className="font-medium">Email :</span> {email}</p>
              <p><span className="font-medium">ID Tuteur :</span> {tuteurData.idTuteur}</p>
            </div>
          </div>

          {/* Informations du groupe */}
          {groupe && (
            <div className="bg-[#f8f1ea] p-6 rounded-lg shadow-md border border-[#d4b9a1]">
              <h2 className="text-2xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
                Informations du groupe
              </h2>
              <div className="space-y-3 text-[#6e4c34]">
                <p><span className="font-medium">ID du groupe :</span> {groupe.idGroupe}</p>
                <p><span className="font-medium">Nom du groupe :</span> {groupe.nomGroupe}</p>

                {/* Sujet */}
                {groupe.sujet && (
                  <div className="mt-4 pt-4 border-t border-[#d4b9a1]">
                    <h3 className="text-lg font-semibold text-[#b17a56]">Sujet</h3>
                    <p><span className="font-medium">ID du sujet :</span> {groupe.sujet.idSujet}</p>
                    <p><span className="font-medium">Titre :</span> {groupe.sujet.titre}</p>
                    
                    {/* Encadrant */}
                    {groupe.sujet.encadrant && (
                      <div className="mt-4 pt-4 border-t border-[#d4b9a1]">
                        <h3 className="text-lg font-semibold text-[#b17a56]">Encadrant</h3>
                        <p><span className="font-medium">Nom :</span> {groupe.sujet.encadrant.nom}</p>
                        <p><span className="font-medium">Prénom :</span> {groupe.sujet.encadrant.prenom}</p>

                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Étudiants du groupe */}
        {groupe && groupe.etudiants && groupe.etudiants.length > 0 && (
          <div className="bg-[#f8f1ea] p-6 rounded-lg shadow-md mb-8 border border-[#d4b9a1]">
            <h2 className="text-2xl font-semibold text-[#6e4c34] mb-4 border-b border-[#d4b9a1] pb-2">
              Étudiants du groupe
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupe.etudiants.map((etudiant, index) => (
                <li 
                  key={index} 
                  className="bg-white p-4 rounded-lg shadow-sm border border-[#d4b9a1] hover:shadow-md transition-shadow"
                >
                  <p className="text-[#6e4c34]"><span className="font-medium text-[#b17a56]">Nom :</span> {etudiant.nom} {etudiant.prenom}</p>
                  <p className="text-[#6e4c34]"><span className="font-medium text-[#b17a56]">ID Étudiant :</span> {etudiant.idEtudiant}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}