import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from '../constants'; // Nous allons créer ce fichier pour la clé d'injection

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Récupérez depuis les variables d'environnement
      api_key: process.env.CLOUDINARY_API_KEY,       // Récupérez depuis les variables d'environnement
      api_secret: process.env.CLOUDINARY_API_SECRET, // Récupérez depuis les variables d'environnement
    });
  },
};
