import Papa from 'papaparse';
import { utils, writeFile } from 'xlsx';
import { Player, PlayerRole, User } from '../types';

export const parsePlayerCsv = (file: File): Promise<Player[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim().toLowerCase().replace(/^\ufeff/, ''), // Sanitize: trim, lowercase, remove BOM
      complete: (results) => {
        try {
          if (results.errors.length) {
            const firstError = results.errors[0];
            reject(new Error(`Errore di parsing nel CSV alla riga ${firstError.row + 1}: ${firstError.message}`));
            return;
          }

          const requiredHeaders = ['name', 'role', 'club', 'value'];
          const headers = results.meta.fields;
          if (!headers || !requiredHeaders.every(h => headers.includes(h))) {
            const missing = requiredHeaders.filter(h => !headers?.includes(h));
            reject(new Error(`Intestazioni CSV non valide. Colonne richieste mancanti: ${missing.join(', ')}. L'intestazione deve contenere 'name,role,club,value'.`));
            return;
          }

          const players: Player[] = results.data.map((row: any, index: number) => {
            const rowNumber = index + 2; // +2 for user-facing row number (1-based + header)
            
            const missingOrEmptyFields = requiredHeaders.filter(field => row[field] == null || String(row[field]).trim() === '');
            if (missingOrEmptyFields.length > 0) {
              const rowContent = JSON.stringify(row);
              throw new Error(
                `Dati non validi nella riga ${rowNumber} del CSV. Campi obbligatori mancanti o vuoti: ${missingOrEmptyFields.join(', ')}.\n` +
                `Contenuto della riga rilevato: ${rowContent}.\n` +
                `Assicurati che la riga abbia un valore per 'name', 'role', 'club', e 'value'.`
              );
            }

            const role = String(row.role).trim().toUpperCase() as PlayerRole;
            if (!['P', 'D', 'C', 'A'].includes(role)) {
              throw new Error(`Ruolo '${row.role}' non valido nella riga ${rowNumber} del CSV. Deve essere P, D, C o A.`);
            }

            const baseValue = parseInt(row.value, 10);
            if (isNaN(baseValue)) {
                throw new Error(`Valore '${row.value}' non valido nella riga ${rowNumber} del CSV. Deve essere un numero.`);
            }
            return {
              id: `${String(row.name).trim().replace(/\s/g, '-')}-${index}`,
              name: String(row.name).trim(),
              role: role,
              club: String(row.club).trim(),
              baseValue: baseValue,
            };
          });
          resolve(players);
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      },
      error: (error: Error) => {
        reject(new Error(`Errore nel caricamento del file: ${error.message}`));
      },
    });
  });
};


export const exportSquadToExcel = (squad: Player[], userName: string) => {
    const worksheetData = squad.map(player => ({
        Nome: player.name,
        Ruolo: player.role,
        Club: player.club,
        'Pagato': player.baseValue, // Using baseValue to store the price paid
    }));

    const worksheet = utils.json_to_sheet(worksheetData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'La Mia Rosa');
    
    // Auto-size columns for better readability
    const cols = Object.keys(worksheetData[0] || {}).map(key => ({wch: Math.max(15, key.length + 2)}));
    worksheet['!cols'] = cols;

    writeFile(workbook, `${userName}_Fantacalcio_Rosa.xlsx`);
};

export const exportAllSquadsToExcel = (users: Map<string, User>) => {
    const workbook = utils.book_new();
    users.forEach((user) => {
        if (user.squad.length > 0) { // Admin is now included
            const worksheetData = user.squad.map(player => ({
                Nome: player.name,
                Ruolo: player.role,
                Club: player.club,
                'Pagato': player.baseValue,
            }));
            const worksheet = utils.json_to_sheet(worksheetData);
            const cols = Object.keys(worksheetData[0] || {}).map(key => ({wch: Math.max(15, key.length + 2)}));
            worksheet['!cols'] = cols;
            utils.book_append_sheet(workbook, worksheet, user.name);
        }
    });

    if (workbook.SheetNames.length > 0) {
        writeFile(workbook, `Risultati_Asta_Fantacalcio.xlsx`);
    } else {
        alert("Nessuna rosa da esportare. Almeno un utente deve avere dei giocatori in rosa.");
    }
};