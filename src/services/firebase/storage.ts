import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Upload a profile image to Firebase Storage
 * @param userId The ID of the user
 * @param uri The local URI of the image
 * @returns The download URL of the uploaded image
 */
export const uploadProfileImage = async (userId: string, uri: string): Promise<string> => {
    try {
        console.log('uploadProfileImage: Starting upload for user', userId, 'URI:', uri);

        // 1. Fetch the image and convert it to a blob
        const blob: Blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.error('uploadProfileImage: XMLHttpRequest error', e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });

        console.log('uploadProfileImage: Blob created, size:', blob.size, 'type:', blob.type);

        // 2. Create a reference to the storage location
        const storageRef = ref(storage, `profile_images/${userId}`);

        // 3. Upload the blob with explicit metadata
        const metadata = {
            contentType: blob.type || 'image/jpeg',
        };

        console.log('uploadProfileImage: Uploading to Firebase Storage with metadata:', metadata);

        try {
            const snapshot = await uploadBytes(storageRef, blob, metadata);
            console.log('uploadProfileImage: Upload complete.');

            // 4. Get and return the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log("uploadProfileImage: downloadURL", downloadURL);

            return downloadURL;
        } catch (uploadError: any) {
            console.error('uploadProfileImage: Firebase Storage Upload Error', uploadError);
            // Log more details if available
            if (uploadError.serverResponse) {
                console.error('uploadProfileImage: Server Response:', uploadError.serverResponse);
            }
            throw uploadError;
        } finally {
            // Clean up the blob
            if (typeof (blob as any).close === 'function') {
                (blob as any).close();
            }
        }
    } catch (error: any) {
        console.error('Error in uploadProfileImage:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};
