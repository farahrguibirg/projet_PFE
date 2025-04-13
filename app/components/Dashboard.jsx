// Dashboard.jsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import StatsCard from "./StatsCard";
import { Group, Folder, CheckCircle, BarChart } from "@mui/icons-material";

const data = [
  { name: "Jan", utilisateurs: 2000, revenu: 2400 },
  { name: "Feb", utilisateurs: 3000, revenu: 2200 },
  { name: "Mar", utilisateurs: 5000, revenu: 2600 },
  { name: "Avr", utilisateurs: 4500, revenu: 3000 },
  { name: "Mai", utilisateurs: 5500, revenu: 3400 },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <BarChart style={{ color: "#2563EB", width: 28, height: 28 }} /> Statistiques
        </h2>
        
        {/* Cartes des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard 
            title="Groupes d'étudiants" 
            value="45" 
            description="Groupes actifs" 
            icon={<Group style={{ width: 24, height: 24 }} />} 
            color="blue" 
          />
          
          <StatsCard 
            title="Projets" 
            value="78" 
            description="Projets en cours" 
            icon={<Folder style={{ width: 24, height: 24 }} />} 
            color="green" 
          />
          
          <StatsCard 
            title="Projets complétés" 
            value="23" 
            description="Terminés ce semestre" 
            icon={<CheckCircle style={{ width: 24, height: 24 }} />} 
            color="yellow" 
          />
        </div>
      </section>
      
      {/* Graphique */}
      <section className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-medium mb-4">Évolution mensuelle</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="utilisateurs"
                stroke="#3B82F6"
                activeDot={{ r: 8 }}
                name="Utilisateurs"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="revenu" 
                stroke="#10B981" 
                name="Revenu (€)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}