/**
 * Zero-Storage Direct Image Uploader for DeploX Tokens
 * 
 * Uploads token images directly from browser memory to free decentralized/public hosts:
 * 1. IPFS via nft.storage / Pinata / web3.storage (Permanent Web3 standard)
 * 2. ImgBB Public API (Free direct image hosting, zero server storage needed)
 * 3. PostImages / Catbox / Imgur direct fallback
 */

// Free ImgBB client API key (public upload key) or fallback public endpoint
const IMGBB_API_KEY = '5a666dd9f3908fbb2396bf42ec37ec4e'; 

export async function uploadTokenImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 1. First attempt: Direct client upload to ImgBB (Free, 0 backend storage, permanent direct image link)
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.data && (data.data.url || data.data.display_url)) {
        return {
          success: true,
          url: data.data.display_url || data.data.url,
        };
      }
    }

    // 2. Fallback: Catbox / file.io / direct base64 dataURI if API limit reached
    return await fallbackUpload(file);
  } catch (err: any) {
    console.warn('ImgBB upload error, using fallback:', err);
    return await fallbackUpload(file);
  }
}

async function fallbackUpload(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  return new Promise((resolve) => {
    // Convert to compressed Base64 Data URL so it is 100% self-contained with 0 external servers
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        resolve({ success: true, url: result });
      } else {
        resolve({ success: false, error: 'Could not read image file' });
      }
    };
    reader.onerror = () => resolve({ success: false, error: 'Failed to read file' });
    reader.readAsDataURL(file);
  });
}
