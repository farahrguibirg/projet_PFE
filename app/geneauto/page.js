'use client';
import React, { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { useRouter } from "next/navigation";
import FormField from "../components/FormField";
import ScrollToTop from '../components/ScrollToTop';

function App() {
    
    const [formData, setFormData] = useState({
        choixGenerer: "",
        nombreGroupes: "",
        nombreEtudiantsParGroupe: "",
        groupeType: "numerique"
    });
    const [groupes, setGroupes] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setGroupes([]);
        setIsLoading(true);

        const { choixGenerer, nombreEtudiantsParGroupe, nombreGroupes, groupeType } = formData;

        if (choixGenerer === "parEtudiants" && (!nombreEtudiantsParGroupe || nombreEtudiantsParGroupe <= 0)) {
            setIsLoading(false);
            return setMessage("Veuillez spécifier un nombre valide d'étudiants par groupe.");
        }
        if (choixGenerer === "parGroupes" && (!nombreGroupes || nombreGroupes <= 0)) {
            setIsLoading(false);
            return setMessage("Veuillez spécifier un nombre valide de groupes.");
        }

        const data = { type: groupeType };
        if (choixGenerer === "parEtudiants") {
            data.nombreEtudiantsParGroupe = parseInt(nombreEtudiantsParGroupe);
        } else if (choixGenerer === "parGroupes") {
            data.nombreGroupes = parseInt(nombreGroupes);
        }

        try {
            const response = await axios.post("http://localhost:5000/api/generer-groupes", data);
            setMessage(response.data.message);
            setGroupes(response.data.groupes);
        } catch (error) {
            setMessage(error.response?.data?.message || "Une erreur s'est produite");
        } finally {
            setIsLoading(false);
        }
    };

    const generationOptions = [
        <option key="empty" value="">Sélectionner une option</option>,
        <option key="etudiants" value="parEtudiants">Par nombre d'étudiants par groupe</option>,
        <option key="groupes" value="parGroupes">Par nombre de groupes</option>
    ];

    const typeOptions = [
        <option key="numerique" value="numerique">Groupe numérique</option>,
        <option key="alphabet" value="alphabet">Groupe alphabétique</option>
    ];

    return (
        <Layout>
            <div className="flex justify-end p-6">
                <button
                    onClick={() => router.push('/geneman')}
                    className="flex items-center px-4 py-2 rounded-md text-white font-medium bg-[#b17a56] hover:bg-[#8c6244] transition-colors"
                >
                    Aller à la modification
                </button>
            </div>

            <div className="mt-6 p-6 overflow-y-auto">
                <h2 className="  form-title text-3xl font-semibold text-gray-800 underline  ">Génération des groupes</h2>
                
                <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6 bg-white p-8 rounded-lg shadow-lg border border-gray-200">
                    <div className="space-y-4">
                        <FormField
                            label="Choisir la méthode de génération :"
                            name="choixGenerer"
                            type="select"
                            value={formData.choixGenerer}
                            onChange={handleChange}
                            options={generationOptions}
                        />

                        {formData.choixGenerer === "parEtudiants" && (
                            <FormField
                                label="Nombre d'étudiants par groupe :"
                                name="nombreEtudiantsParGroupe"
                                type="number"
                                value={formData.nombreEtudiantsParGroupe}
                                onChange={handleChange}
                            />
                        )}

                        {formData.choixGenerer === "parGroupes" && (
                            <FormField
                                label="Nombre de groupes :"
                                name="nombreGroupes"
                                type="number"
                                value={formData.nombreGroupes}
                                onChange={handleChange}
                            />
                        )}

                        <FormField
                            label="Type de génération du nom:"
                            name="groupeType"
                            type="select"
                            value={formData.groupeType}
                            onChange={handleChange}
                            options={typeOptions}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all transform hover:scale-105"
                        disabled={isLoading}
                    >
                        {isLoading ? "Génération en cours..." : "Générer"}
                    </button>
                </form>

                {message && (
                    <p className={`mt-8 text-center text-lg font-semibold ${
                        message.includes("erreur") ? "text-red-600" : "text-green-600"
                    }`}>
                        {message}
                    </p>
                )}

                {groupes.length > 0 && (
                    <div className="mt-10 w-full">
                        <h3 className="text-2xl font-semibold text-blue-600 mb-8 text-center">
                            Groupes générés
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupes.map((groupe, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200"
                                >
                                    <h4 className="text-xl font-semibold text-blue-600 mb-4">
                                        {groupe.nomGroupe}
                                    </h4>
                                    <ul className="space-y-2">
                                        {groupe.etudiants.map((etudiant, idx) => (
                                            <li key={idx} className="text-gray-700">
                                                <span className="text-blue-500 mr-2">•</span>
                                                {etudiant.nom} {etudiant.prenom}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        <ScrollToTop />
        </Layout>
    );
}

export default App;