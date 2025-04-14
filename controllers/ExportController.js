
const ExportRepository = require('../repositories/ExportRepository');
const docx = require('docx');
const { Document, Paragraph, Table, TableRow, TableCell, WidthType} = docx;

class ExportController {
    async exportToWord(req, res) {
      try {
        // Get formatted data from repository
        const data = await ExportRepository.getAffectationsForExport();
        
        // Trier les données: groupes affectés en haut, non affectés en bas
        const sortedData = [...data].sort((a, b) => {
          // Tri par statut d'affectation (affecté = true en premier)
          return b.isAffected - a.isAffected;
        });
        
        // Déterminer le nombre maximum d'étudiants dans un groupe
        const maxStudents = Math.max(...sortedData.map(groupe => groupe.etudiants.length));
        
        // Create a new document
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [
                new Paragraph({
                  text: "Affectation des Groupes",
                  heading: docx.HeadingLevel.HEADING_1,
                  spacing: {
                    after: 200
                  }
                }),
                
                // Create table
                new Table({
                  width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  },
                  rows: [
                    // Header row - avec colonnes pour chaque étudiant
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph("Nom du Groupe")],
                        }),
                        // Colonnes pour chaque étudiant
                        ...Array(maxStudents).fill().map((_, index) => 
                          new TableCell({
                            children: [new Paragraph(`Étudiant ${index + 1}`)],
                          })
                        ),
                        new TableCell({
                          children: [new Paragraph("Tuteur")],
                        }),
                        new TableCell({
                          children: [new Paragraph("Encadrant")],
                        }),
                        new TableCell({
                          children: [new Paragraph("Sujet")],
                        }),
                        new TableCell({
                          children: [new Paragraph("Statut")],
                        }),
                      ],
                      tableHeader: true,
                    }),
                    
                    // Data rows avec les noms réels des étudiants
                    ...sortedData.map(groupe => {
                      return new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph(groupe.nomGroupe)],
                          }),
                          // Cellules pour chaque étudiant avec leur vrai nom
                          ...Array(maxStudents).fill().map((_, index) => 
                            new TableCell({
                              children: [new Paragraph(groupe.etudiants[index] || '')],
                            })
                          ),
                          new TableCell({
                            children: [new Paragraph(groupe.tuteur)],
                          }),
                          new TableCell({
                            children: [new Paragraph(groupe.encadrant)],
                          }),
                          new TableCell({
                            children: [new Paragraph(groupe.sujet)],
                          }),
                          new TableCell({
                            children: [new Paragraph(groupe.isAffected ? 'Affecté' : 'Non affecté')],
                            shading: {
                              fill: groupe.isAffected ? "FFFFFF" : "EEEEEE", // Fond gris clair pour non affecté
                            }
                          }),
                        ],
                      });
                    }),
                  ],
                }),
              ],
            },
          ],
        });
    
        // Generate Word document buffer
        const buffer = await docx.Packer.toBuffer(doc);
        
        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=affectation_groupes.docx');
        
        // Send the Word document as response
        res.send(buffer);
      } catch (error) {
        console.error('Erreur exportToWord:', error);
        res.status(500).json({ message: 'Erreur lors de l\'export Word', error: error.message });
      }
    }
}

module.exports = new ExportController();
