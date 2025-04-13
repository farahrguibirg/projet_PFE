"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Layout from "../../../components/Layout";
import FormField from "../../../components/FormField";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { getYearOptions } from "../../../utils/years";

export default function EditTuteur() {
  const [inputs, setInputs] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    annee: "",
    classe: "",
    filiere: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getUser();
    } else {
      setError("L'identifiant du tuteur est manquant");
      setIsLoading(false);
    }
  }, [id]);

  function getUser() {
    axios.get(`http://localhost:5000/api/getTuteur/${id}`)
      .then(function(response) {
        const userData = response.data;
        setInputs({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          motDePasse: userData.motDePasse,
          annee: userData.annee,
          classe: userData.classe,
          filiere: userData.filiere,
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération du tuteur:", err);
        setError("Erreur lors de la récupération des données du tuteur.");
        setIsLoading(false);
      });
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs(prevValues => ({ ...prevValues, [name]: value }));
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.put(`http://localhost:5000/api/editTuteur/${id}`, inputs)
      .then(function(response) {
        router.push('/users/readTute');
      })
      .catch(err => {
        console.error("Erreur lors de la mise à jour du tuteur:", err);
        setError("Erreur lors de la mise à jour du tuteur.");
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
          onClick={() => router.push("/users/readTute")}
          className="back-button"
        >
          <HiArrowNarrowLeft className="mr-2 text-2xl" />
         
        </button>

        <h1 className="form-title">Modifier le tuteur</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="flex justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <FormField
              label="Nom"
              name="nom"
              value={inputs.nom}
              onChange={handleChange}
              placeholder="Entrez le nom"
              required
            />

            <FormField
              label="Prénom"
              name="prenom"
              value={inputs.prenom}
              onChange={handleChange}
              placeholder="Entrez le prénom"
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={inputs.email}
              onChange={handleChange}
              placeholder="Entrez l'email"
              required
            />

            <FormField
              label="Mot de passe"
              name="motDePasse"
              type="password"
              value={inputs.motDePasse}
              onChange={handleChange}
              placeholder="Entrez le mot de passe"
              required
            />

            <FormField
              label="Année"
              name="annee"
              type="select"
              value={inputs.annee}
              onChange={handleChange}
              options={getYearOptions()}
              required
            />

            <FormField
              label="Classe"
              name="classe"
              value={inputs.classe}
              onChange={handleChange}
              placeholder="Entrez la classe"
              required
            />

            <FormField
              label="Filière"
              name="filiere"
              value={inputs.filiere}
              onChange={handleChange}
              placeholder="Entrez la filière"
              required
            />

            <button 
              type="submit" 
              className="form-button mt-6"
            >
              Modifier
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}