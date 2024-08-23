import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import AWS from 'aws-sdk';
const R2 = new AWS.S3({
  endpoint: 'https://0b3b6bb70e8692094f7de9177b93015f.r2.cloudflarestorage.com',
  accessKeyId: '079b03e9494db6fd285207e2f9d40723',
  secretAccessKey: '51157ec9bb58c3c93b6daa1521bf72036de38290f491c1ce95e4c3d18cd05570',
  s3ForcePathStyle: true, // Necesario para Cloudflare R2
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const single = upload.single('image');

export const uploadUserImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }

  const fileName = `${Date.now()}-${req.file.originalname}`;

  const params = {
    Bucket: 'plexostore', 
    Key: fileName,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read', 
  };

  try {
    const data = await R2.upload(params).promise();
    const imagePath = `https://pub-9cbda97d00e44e8397a173d2f883c50d.r2.dev/${fileName}`;

    res.json({ message: 'Image uploaded successfully', imagePath });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).send({ error: 'Error uploading image', details: err.message });
  }
};
