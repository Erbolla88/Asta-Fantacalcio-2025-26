import Papa from 'papaparse';
import { utils, writeFile } from 'xlsx';
import { Player, PlayerRole, User } from '../types';
import { TranslationKey } from '../lib/i18n';


// Type for the translator function
type Translator = (key: TranslationKey, params?: Record<string, string | number>) => string;

export const parsePlayerCsv = (file: File, t: Translator): Promise<Player[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim().toLowerCase().replace(/^\ufeff/, ''), // Sanitize: trim, lowercase, remove BOM
      complete: (results) => {
        try {
          if (results.errors.length) {
            const firstError = results.errors[0];
            reject(new Error(t('errorCsvParse', { row: firstError.row + 1, message: firstError.message })));
            return;
          }

          const requiredHeaders = ['name', 'role', 'club', 'value'];
          const headers = results.meta.fields;
          if (!headers || !requiredHeaders.every(h => headers.includes(h))) {
            const missing = requiredHeaders.filter(h => !headers?.includes(h));
            reject(new Error(t('errorCsvHeaders', { missing: missing.join(', ') })));
            return;
          }

          const players: Player[] = results.data.map((row: any, index: number) => {
            const rowNumber = index + 2; // +2 for user-facing row number (1-based + header)
            
            const missingOrEmptyFields = requiredHeaders.filter(field => row[field] == null || String(row[field]).trim() === '');
            if (missingOrEmptyFields.length > 0) {
              const rowContent = JSON.stringify(row);
              throw new Error(
                `${t('errorCsvInvalidData', { row: rowNumber, fields: missingOrEmptyFields.join(', ') })}\n` +
                `${t('errorCsvInvalidDataContent', { content: rowContent })}\n` +
                `${t('errorCsvInvalidDataInstruction')}`
              );
            }

            const role = String(row.role).trim().toUpperCase() as PlayerRole;
            if (!['P', 'D', 'C', 'A'].includes(role)) {
              throw new Error(t('errorCsvInvalidRole', { role: row.role, row: rowNumber }));
            }

            const baseValue = parseInt(row.value, 10);
            if (isNaN(baseValue)) {
                throw new Error(t('errorCsvInvalidValue', { value: row.value, row: rowNumber }));
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
        reject(new Error(t('errorFileLoad', { message: error.message })));
      },
    });
  });
};


export const exportSquadToExcel = (squad: Player[], userName: string, t: Translator) => {
    const worksheetData = squad.map(player => ({
        [t('adminPlayerName')]: player.name,
        [t('roleP').charAt(0)]: player.role, // Assuming Role is a single char, take first letter of translated role
        Club: player.club,
        Paid: player.baseValue, 
    }));

    const worksheet = utils.json_to_sheet(worksheetData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'My Squad');
    
    const cols = Object.keys(worksheetData[0] || {}).map(key => ({wch: Math.max(15, key.length + 2)}));
    worksheet['!cols'] = cols;

    writeFile(workbook, `${userName}_Fantacalcio_Squad.xlsx`);
};

export const exportAllSquadsToExcel = (users: Map<string, User>, t: Translator) => {
    const workbook = utils.book_new();
    users.forEach((user) => {
        if (user && user.squad && user.squad.length > 0) {
            const worksheetData = user.squad.map(player => ({
                [t('adminPlayerName')]: player.name,
                [t('roleP').charAt(0)]: player.role,
                Club: player.club,
                Paid: player.baseValue,
            }));
            const worksheet = utils.json_to_sheet(worksheetData);
            const cols = Object.keys(worksheetData[0] || {}).map(key => ({wch: Math.max(15, key.length + 2)}));
            worksheet['!cols'] = cols;
            utils.book_append_sheet(workbook, worksheet, user.name);
        }
    });

    if (workbook.SheetNames.length > 0) {
        writeFile(workbook, `Auction_Results.xlsx`);
    } else {
        alert(t('errorNoSquadsToExport'));
    }
};