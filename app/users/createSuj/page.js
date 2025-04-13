"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import FormField from "../../components/FormField";
import { HiArrowNarrowLeft } from "react-icons/hi";
import cookies from "js-cookie";

const AddSujet = () => {
  const [inputs, setInputs] = useState({
    titre: "",
    idEncadrant: "",
  });

  const [encadrants, setEncadrants] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchEncadrants = async () => {
      try {
        const token = cookies.get("token");
        const response = await axios.get("http://localhost:5000/api/encadrants", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEncadrants(response.data);
      } catch (err) {
        setError("Erreur de chargement des encadrants");
      }
    };

    fetchEncadrants();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    
    try {
      const token = cookies.get("token");
      if (!token) {
        throw new Error("Non autorisé. Veuillez vous connecter.");
      }

      const { titre, idEncadrant } = inputs;
      
      const response = await axios.post(
        "http://localhost:5000/api/addSujet", 
        { 
          titre,
          idEncadrant
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Le backend doit retourner le statut dans la réponse
      if (response.data.success) {
        const isApproved = response.data.sujet.status === 'approved';
        setSuccess(`Sujet ${isApproved ? "approuvé" : "proposé"} avec succès!`);
        setTimeout(() => router.push("/users/readSuj"), 1500);
      }
    } catch (err) {
      console.error("Erreur:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Erreur lors de l'ajout du sujet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="form-container w-full max-w-2xl">
        <button 
          onClick={() => router.push("/users/readSuj")} 
          className="back-button"
        >
          <HiArrowNarrowLeft className="mr-2 text-2xl" />
        </button>

        <h1 className="form-title">Ajouter un Sujet</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="flex justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <FormField
              label="Titre du sujet"
              name="titre"
              value={inputs.titre}
              onChange={handleChange}
              placeholder="Entrez le titre"
              required
            />

            <FormField
              label="Encadrant"
              name="idEncadrant"
              type="select"
              value={inputs.idEncadrant}
              onChange={handleChange}
              options={[
                <option key="empty" value="" disabled>Choisir un encadrant</option>,
                ...encadrants.map(enc => (
                  <option key={enc.idEncadrant} value={enc.idEncadrant}>
                    {enc.nom} {enc.prenom}
                  </option>
                ))
              ]}
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

export default AddSujet;