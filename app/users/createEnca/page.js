"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import FormField from "../../components/FormField";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { getYearOptions } from "../../utils/years";

const AddEncadrant = () => {
  const [inputs, setInputs] = useState({
    idEncadrant: "",
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    annee: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!inputs.email.includes("@")) {
      setErrorMessage("L'adresse email n'est pas valide.");
      return;
    }

    if (inputs.motDePasse.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      setErrorMessage("");
      setSuccessMessage("");

      await axios.post("http://localhost:5000/api/addEncadrant", inputs);
      setSuccessMessage("Encadrant ajouté avec succès !");
      router.push("/users/readEnca/");
    } catch (err) {
      setErrorMessage("Erreur lors de l'ajout de l'encadrant.");
      console.error("Erreur lors de l'ajout de l'encadrant:", err);
    }
  };

  return (
    <Layout>
      <div className="form-container">
        <button
          onClick={() => router.push("/users/readEnca")}
          className="back-button"
        >
          <HiArrowNarrowLeft className="mr-2 text-2xl" />
        </button>

        <h1 className="form-title">Ajouter un Encadrant</h1>

        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
          <FormField
            label="ID Encadrant"
            name="idEncadrant"
            value={inputs.idEncadrant}
            onChange={handleChange}
            placeholder="Entrez l'ID de l'encadrant"
            required
          />

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
            label="Adresse email"
            name="email"
            type="email"
            value={inputs.email}
            onChange={handleChange}
            placeholder="Entrez l'adresse email"
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
            label="Année d'inscription"
            name="annee"
            type="select"
            value={inputs.annee}
            onChange={handleChange}
            options={getYearOptions()}
            required
          />

          <button type="submit" className="form-button mt-6">
            Ajouter
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddEncadrant;