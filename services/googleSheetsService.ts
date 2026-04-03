
import Papa from 'papaparse';

export interface WorkerOffer {
    img: string;
    name: string;
    city: string;
    price: string;
    title: string;
    description: string;
}

const SHEET_ID = '1aguARSjyWs9gEWEmmnusbaUFZGeoEk8_2feh-x4YBeU';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

export const googleSheetsService = {
    async fetchWorkerOffers(): Promise<WorkerOffer[]> {
        try {
            const response = await fetch(CSV_URL);
            if (!response.ok) throw new Error('Failed to fetch Google Sheet data');
            
            const csvText = await response.text();
            
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const data = results.data as any[];
                        const mappedData: WorkerOffer[] = data.map((row) => ({
                            img: row['Cliquer pour prendre une photo'] || '',
                            name: row['Prénom '] || row['Prénom'] || '',
                            city: row['Ville'] || '',
                            price: row['Salaire'] || '',
                            title: row['Poste'] || '',
                            description: row['Description'] || 'Travailleur qualifié disponible'
                        })).filter(item => item.name && item.title); // Filter out empty rows
                        
                        resolve(mappedData);
                    },
                    error: (error: any) => {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.error('Error fetching Google Sheets data:', error);
            return [];
        }
    }
};
