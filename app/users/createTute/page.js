"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import FormField from "../../components/FormField";
import { HiArrowNarrowLeft } from "react-icons/hi";
import { getYearOptions } from "../../utils/years";

const AddTuteur = () => {
  const [inputs, setInputs] = useState({
    idTuteur: "",
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    annee: "",
    classe: "",
    filiere: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/addTuteur", inputs);
      router.push("/users/readTute/");
    } catch (err) {
      setError("Erreur lors de l'ajout du tuteur.");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="form-container w-full max-w-2xl">
        <button onClick={() => router.push("/users/readTute")} className="back-button">
          <HiArrowNarrowLeft className="mr-2 text-2xl" />
        </button>

        <h1 className="form-title">Ajouter un Tuteur</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="flex justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <FormField
              label="CIN"
              name="idTuteur"
              value={inputs.idTuteur}
              onChange={handleChange}
              placeholder="Entrez le CIN"
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
              disabled={loading}
            >
              {loading ? "Chargement..." : "Ajouter"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AddTuteur;