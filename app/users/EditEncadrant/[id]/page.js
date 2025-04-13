"use client";
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Layout from "../../../components/Layout";
import FormField from "../../../components/FormField";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { getYearOptions } from "../../../utils/years";

export default function EditEncadrant() {
  const [inputs, setInputs] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    annee: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const router = useRouter();

  const getUser = useCallback(() => {
    axios.get(`http://localhost:5000/api/getEncadrant/${id}`)
      .then(function(response) {
        console.log("API Response:", response.data);
        
        // Handle the array response - take the first item
        const responseData = response.data;
        
        if (Array.isArray(responseData) && responseData.length > 0) {
          // Extract the first object from the array
          const userData = responseData[0];
          
          setInputs({
            nom: userData.nom || "",
            prenom: userData.prenom || "",
            email: userData.email || "",
            motDePasse: userData.motDePasse || "",
            annee: userData.annee || "",
          });
        } else {
          setError("Les données de l'encadrant sont invalides ou vides.");
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération de l'encadrant:", err);
        setError("Erreur lors de la récupération des données de l'encadrant.");
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (id) {
      getUser();
    } else {
      setError("L'identifiant de l'encadrant est manquant");
      setIsLoading(false);
    }
  }, [id, getUser]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs(prevValues => ({ ...prevValues, [name]: value }));
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.put(`http://localhost:5000/api/editEncadrant/${id}`, inputs)
      .then(function(response) {
        console.log("Update response:", response.data);
        router.push('/users/readEnca');
      })
      .catch(err => {
        console.error("Erreur lors de la mise à jour de l'encadrant:", err);
        setError("Erreur lors de la mise à jour de l'encadrant.");
      });
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="text-center">Chargement...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="form-container w-full max-w-2xl">
        <button
          onClick={() => router.push("/users/readEnca")}
          className="back-button"
        >
          <HiArrowNarrowLeft className="mr-2 text-2xl" />
        </button>

        <h1 className="form-title">Modifier Encadrant</h1>

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