"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Layout from "../../../components/Layout";
import FormField from "../../../components/FormField";
import { HiArrowNarrowLeft } from "react-icons/hi";

export default function EditSujet() {
  const [inputs, setInputs] = useState({
    titre: "",
    encadrantId: "", // Ajout de l'ID de l'encadrant
    encadrantNom: "", // Nom de l'encadrant
    encadrantPrenom: "" // Prénom de l'encadrant
  });
  const [encadrants, setEncadrants] = useState([]); // Liste des encadrants
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getSujet();
      getEncadrants(); // Charger les encadrants
    } else {
      setError("L'identifiant du sujet est manquant");
      setIsLoading(false);
    }
  }, [id]);

  function getSujet() {
    axios.get(`http://localhost:5000/api/getsujet/${id}`)
      .then(function(response) {
        const sujetData = response.data;
        setInputs({
          titre: sujetData.titre
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération du sujet:", err);
        setError("Erreur lors de la récupération des données du sujet.");
        setIsLoading(false);
      });
  }

  async function getEncadrants() {
    try {
      const response = await axios.get("http://localhost:5000/api/encadrants");
      setEncadrants(response.data); // Mettre à jour le state des encadrants
    } catch (err) {
      console.error("Erreur lors de la récupération des encadrants:", err);
      setError("Erreur lors de la récupération des encadrants.");
    }
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs(prevValues => ({ ...prevValues, [name]: value }));
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.put(`http://localhost:5000/api/editsujet/${id}`, inputs)
      .then(function(response) {
        router.push('/users/readSuj');
      })
      .catch(err => {
        console.error("Erreur lors de la mise à jour du sujet:", err);
        setError("Erreur lors de la mise à jour du sujet.");
      });
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="text-center">Chargement en cours...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="form-container w-full max-w-2xl">
        <button
          onClick={() => router.push("/users/readSuj")}
          className="back-button mb-4 text-blue-600 hover:text-blue-800"
        >
          <HiArrowNarrowLeft className="mr-2 text-2xl" />
        
        </button>

        <h1 className="form-title text-2xl font-semibold text-center mb-6">Modifier le sujet</h1>

        {error && <div className="error-message text-red-500 text-center mb-4">{error}</div>}

        <div className="flex justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <FormField
              label="Nom du sujet"
              name="titre"
              value={inputs.titre}
              onChange={handleChange}
              placeholder="Entrez le nom du sujet"
              required
            />
            
            {/* Sélection de l'encadrant */}
            <div className="mb-4">
              <label htmlFor="idEncadrant" className="block text-sm font-medium text-gray-700 mb-1">
                Sélectionner un encadrant
              </label>
              <select
                name="encadrantId"
                id="encadrantId"
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition"
                onChange={handleChange}
                value={inputs.encadrantId || ""}
                required
              >
                <option value="" disabled>Choisir un encadrant</option>
                {encadrants.length > 0 ? (
                  encadrants.map((encadrant) => (
                    <option key={encadrant.idEncadrant} value={encadrant.idEncadrant}>
                      {encadrant.nom} {encadrant.prenom}
                    </option>
                  ))
                ) : (
                  <option disabled>Aucun encadrant disponible</option>
                )}
              </select>
              {/* Affichage d'un message d'erreur si l'encadrant n'est pas sélectionné */}
              {error && !inputs.encadrantId && (
                <p className="text-red-500 text-xs mt-1">Veuillez sélectionner un encadrant.</p>
              )}
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="bg-blue-500 text-white w-full py-2 px-5 rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              Modifier
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
