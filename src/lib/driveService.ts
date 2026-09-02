import { getAccessToken } from './googleAuth';

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
}

/**
 * Lists metadata files or photos located in the application's hidden appDataFolder.
 */
export async function listAppDataFiles(): Promise<DriveFileInfo[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google OAuth access token available. Please sign in.');
  }

  const query = encodeURIComponent("trashed = false");
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

  // 1. Create multipart boundary body
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
