// eslint-disable-next-line @typescript-eslint/no-require-imports
const xlsx = require('xlsx'); // Package pour lire les fichiers Excel
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ExcelJS = require('exceljs');



class FileService {
  static parseExcelFile(file) {
    if (!file) {
      throw new Error("Aucun fichier fourni.");
    }

    // Vérifier que le fichier a bien l'extension .xlsx
    if (!file.originalname || !file.originalname.endsWith('.xlsx')) {
      throw new Error("Le fichier doit être au format .xlsx.");
    }

    try {
      // Lire le fichier directement depuis le buffer (mémoire)
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });

      // Vérifier si le fichier a des feuilles de calcul
      if (workbook.SheetNames.length === 0) {
        throw new Error("Aucune feuille de calcul trouvée dans le fichier.");
      }

      const sheetName = workbook.SheetNames[0]; // Prend la première feuille
      const sheet = workbook.Sheets[sheetName];

      // Convertir la feuille en JSON
      const data = xlsx.utils.sheet_to_json(sheet);

      // Vérifier si des données ont été extraites
      if (data.length === 0) {
        throw new Error("Le fichier est vide ou les données sont invalides.");
      }

      return data;
    } catch (error) {
      throw new Error("Erreur lors de la lecture du fichier : " + error.message);
    }
  }

  static async generateExcelFile(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Encadrants');

    // Définir les en-têtes de colonne
    worksheet.columns = [
      { header: 'idEncadrant', key: 'idEncadrant', width: 15 },
      { header: 'nom', key: 'nom', width: 20 },
      { header: 'prenom', key: 'prenom', width: 20 },
      { header: 'Titre1', key: 'titre1', width: 30 },
      { header: 'Titre2', key: 'titre2', width: 30 },
      { header: 'Titre3', key: 'titre3', width: 30 },
      { header: 'Titre4', key: 'titre4', width: 30 },
      { header: 'Titre5', key: 'titre5', width: 30 },
    ];

    // Ajouter les données
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    // Générer le buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

module.exports = FileService;
