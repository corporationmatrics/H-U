import { getAccessToken } from './googleAuth';

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

/**
 * Converts a Base64 Data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Finds or creates the dedicated couple photos folder in the signed-in user's Google Drive.
 */
export async function findOrCreateVaultFolder(
  token?: string | null,
  folderName: string = 'TogetherLens Vault (Couple Photos)'
): Promise<string> {
  const authToken = token || (await getAccessToken());
  if (!authToken) {
    throw new Error('No Google Drive authorization token available.');
  }

  // 1. Search for existing folder with this name
  const query = encodeURIComponent(
    `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=1`;

  try {
    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (searchRes.ok) {
      const data = await searchRes.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }
  } catch (err) {
    console.warn('Drive folder search warning:', err);
  }

  // 2. Create the folder if not found
  try {
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'TogetherLens AI Couple Photo Vault — private & secure storage',
      }),
    });

    if (createRes.ok) {
      const createdFolder = await createRes.json();
      return createdFolder.id;
    }
  } catch (err) {
    console.warn('Drive folder creation warning:', err);
  }

  return 'root';
}

/**
 * Uploads an uploaded photo file (or data URL) directly to the user's signed Google Drive folder.
 */
export async function uploadPhotoToGoogleDrive(params: {
  token?: string | null;
  filename: string;
  mimeType?: string;
  dataUrlOrBlob: string | Blob;
  folderId?: string;
  folderName?: string;
}): Promise<DriveFileInfo> {
  const { token, filename, mimeType = 'image/jpeg', dataUrlOrBlob, folderName = 'TogetherLens Vault (Couple Photos)' } = params;
  const authToken = token || (await getAccessToken());

  if (!authToken) {
    throw new Error('Google Drive is not linked. Please sign in to Google Drive.');
  }

  // Ensure target folder exists
  let targetFolderId = params.folderId;
  if (!targetFolderId) {
    try {
      targetFolderId = await findOrCreateVaultFolder(authToken, folderName);
    } catch (e) {
      targetFolderId = 'root';
    }
  }

  // Prepare Blob
  const fileBlob = typeof dataUrlOrBlob === 'string' ? dataUrlToBlob(dataUrlOrBlob) : dataUrlOrBlob;

  // Build Multipart request
  const boundary = '-------TogetherLensDriveBoundary' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: filename,
    parents: targetFolderId && targetFolderId !== 'root' ? [targetFolderId] : [],
    mimeType: mimeType,
    description: 'Uploaded via TogetherLens Couple App',
  };

  const bodyParts = [
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${mimeType}\r\n\r\n`,
    fileBlob,
    closeDelimiter,
  ];

  const multipartBlob = new Blob(bodyParts, { type: `multipart/related; boundary=${boundary}` });

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,thumbnailLink,createdTime';

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    body: multipartBlob,
  });

  if (!response.ok) {
    // If it's a simulated demo token or API issue, return simulated Drive item gracefully
    if (authToken.startsWith('drv_demo') || authToken.startsWith('mock_')) {
      return {
        id: 'drv_file_' + Math.random().toString(36).substring(2, 9),
        name: filename,
        mimeType: mimeType,
        size: String(fileBlob.size),
        createdTime: new Date().toISOString(),
        webViewLink: `https://drive.google.com/file/d/togetherlens_demo/view`,
      };
    }
    const errText = await response.text();
    throw new Error(`Google Drive Upload Failed (${response.status}): ${errText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Lists metadata files or photos located in the application's hidden appDataFolder.
 */
export async function listAppDataFiles(): Promise<DriveFileInfo[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google OAuth access token available. Please sign in.');
  }

  const query = encodeURIComponent('trashed = false');
  const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,mimeType,size,createdTime,modifiedTime)&pageSize=100`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Uploads a file (or raw JSON metadata index) directly to Google Drive appDataFolder.
 */
export async function uploadToAppDataFolder(
  filename: string,
  mimeType: string,
  content: Blob | string
): Promise<DriveFileInfo> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google OAuth access token available. Please sign in.');
  }

  const boundary = '-------TogetherLensDriveBoundary' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: filename,
    parents: ['appDataFolder'],
    mimeType: mimeType,
  };

  const bodyParts = [
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${mimeType}\r\n\r\n`,
    content,
    closeDelimiter,
  ];

  const blob = new Blob(bodyParts, { type: `multipart/related; boundary=${boundary}` });
  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&spaces=appDataFolder';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: blob,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Drive Upload Failed (${response.status}): ${err}`);
  }

  return await response.json();
}

/**
 * Downloads file content from Google Drive by file ID.
 */
export async function downloadDriveFile(fileId: string): Promise<Blob> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google OAuth access token available. Please sign in.');
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download file from Drive (${response.status})`);
  }

  return await response.blob();
}

/**
 * Deletes a file from Google Drive after confirmation.
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google OAuth access token available. Please sign in.');
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.ok;
}
