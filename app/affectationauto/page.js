'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Layout from "../components/Layout";
import ScrollToTop from "../components/ScrollToTop";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAffectationDone, setIsAffectationDone] = useState(false);
  const router = useRouter();

  const handleAffectation = async () => {
    if (isAffectationDone) {
      setError("L'affectation a déjà été réalisée.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/affectation', {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setResult(response.data);
      setIsAffectationDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'affectation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Barre d'affectation */}
      <div className="mt-16 p-10 bg-white shadow-lg rounded-lg mx-8 my-6 border border-[#d4b9a1]">
        <h1 className="text-2xl font-bold mb-2 text-[#b17a56]">
          Affectation Aléatoire des Tuteurs et Sujets
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={handleAffectation}
            disabled={loading || isAffectationDone}
            className={`px-6 py-3 text-lg ${
              loading || isAffectationDone 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#b17a56] hover:bg-[#8c6244]'
            } text-white rounded-lg shadow-md transition-all transform hover:scale-105`}
          >
            {loading ? 'Chargement...' : isAffectationDone ? 'Affectation déjà réalisée' : "Lancer l'affectation"}
          </button>

          <button
            onClick={() => router.push('/affectation')}
            className="px-6 py-3 text-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg shadow-md transition-all transform hover:scale-105"
          >
            Aller à la modification
          </button>
        </div>
      </div>

      {/* Contenu défilant (résultats de l'affectation) */}
      <div className="mt-6 p-6 overflow-y-auto mx-8">
        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-[#d4b9a1]">
            <h2 className="text-2xl text-[#b17a56] font-semibold mb-6">
              Résultats de l'affectation :
            </h2>
            {result.data && result.data.length > 0 ? (
              <div className="space-y-6 w-full">
                {result.data.map((groupe, index) => (
                  <div
                    key={index}
                    className="bg-[#f8f1ea] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-[#d4b9a1] w-full transform hover:scale-101"
                  >
                    {/* Titre du groupe */}
                    <h3 className="text-xl font-semibold text-[#6e4c34] mb-4">
                      Groupe : {groupe.groupeNom}
                    </h3>

                    {/* Tuteur */}
                    <div className="mb-4">
                      <p className="text-sm text-[#6e4c34] font-medium">Tuteur</p>
                      <p className="text-lg text-[#6e4c34]">
                        {groupe.tuteurNom ? groupe.tuteurNom : 'Non assigné'}
                      </p>
                    </div>

                    {/* Sujet */}
                    <div className="mb-4">
                      <p className="text-sm text-[#6e4c34] font-medium">Sujet</p>
                      <p className="text-lg text-[#6e4c34]">{groupe.sujetTitre}</p>
                    </div>

                    {/* Étudiants */}
                    <div>
                      <p className="text-sm text-[#6e4c34] font-medium">Étudiants</p>
                      <ul className="mt-2 space-y-2">
                        {groupe.etudiants.map((etudiant, i) => (
                          <li key={`${groupe.groupeNom}-${i}`} className="text-[#6e4c34]">
                            <span className="text-[#b17a56] mr-2">•</span>
                            {etudiant}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#6e4c34] text-center">Aucun groupe disponible.</p>
            )}
          </div>
        )}
      </div>
      <ScrollToTop />
    </Layout>
  );
}