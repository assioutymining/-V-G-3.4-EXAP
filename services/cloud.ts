
declare const gapi: any;
declare const google: any;

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const BACKUP_FILENAME = "PyramidsGold_Backup.json";

export const CloudService = {
  initialized: false,
  tokenClient: null as any,
  accessToken: null as string | null,

  init: async (apiKey: string, clientId: string): Promise<boolean> => {
    if (!gapi || !google) {
      console.error("Google Scripts not loaded");
      return false;
    }

    return new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: apiKey,
            discoveryDocs: DISCOVERY_DOCS,
          });

          // Initialize Token Client (GIS)
          CloudService.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: SCOPES,
            callback: (tokenResponse: any) => {
              if (tokenResponse && tokenResponse.access_token) {
                 CloudService.accessToken = tokenResponse.access_token;
              }
            },
          });

          CloudService.initialized = true;
          resolve(true);
        } catch (error) {
          console.error("GAPI Init Error:", error);
          reject(error);
        }
      });
    });
  },

  signIn: (): Promise<void> => {
    return new Promise((resolve, reject) => {
       if(!CloudService.tokenClient) return reject("Token Client not initialized");
       
       // Override callback to capture resolution
       CloudService.tokenClient.callback = (resp: any) => {
          if (resp.error) {
             reject(resp);
          } else {
             CloudService.accessToken = resp.access_token;
             resolve();
          }
       };
       
       CloudService.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  },

  // Find existing backup file
  findBackupFile: async (): Promise<string | null> => {
     try {
       const response = await gapi.client.drive.files.list({
         'pageSize': 1,
         'fields': "files(id, name)",
         'q': `name = '${BACKUP_FILENAME}' and trashed = false`
       });
       const files = response.result.files;
       if (files && files.length > 0) {
         return files[0].id;
       }
       return null;
     } catch (err) {
       console.error("Error finding file", err);
       return null;
     }
  },

  // Upload (Create or Update)
  backup: async (data: any): Promise<void> => {
    const fileContent = JSON.stringify(data);
    const fileId = await CloudService.findBackupFile();
    
    const file = new Blob([fileContent], { type: 'application/json' });
    const metadata = {
      'name': BACKUP_FILENAME,
      'mimeType': 'application/json',
    };

    const accessToken = gapi.auth.getToken().access_token; 
    // Note: gapi.client.init sets the token globally for gapi.client requests if we used GIS correctly,
    // but sometimes we need to construct the request manually for multipart uploads.
    
    if (fileId) {
       // Update existing file
       // Using simple upload endpoint for update: PATCH /upload/drive/v3/files/fileId?uploadType=media
       const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
       await fetch(url, {
         method: 'PATCH',
         headers: {
           Authorization: `Bearer ${CloudService.accessToken}`,
           'Content-Type': 'application/json'
         },
         body: fileContent
       });
    } else {
       // Create new file
       // We use the Multipart upload to set name and content together
       const form = new FormData();
       form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
       form.append('file', file);

       const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
       await fetch(url, {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${CloudService.accessToken}`
         },
         body: form
       });
    }
  },

  // Download Backup
  restore: async (): Promise<any> => {
    const fileId = await CloudService.findBackupFile();
    if (!fileId) throw new Error("لم يتم العثور على ملف نسخ احتياطي");

    const response = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    });
    
    return response.result; // The JSON content
  }
};
