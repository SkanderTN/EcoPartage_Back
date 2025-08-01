import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import toStream = require('buffer-to-stream'); // Pour convertir le buffer du fichier en stream

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'profile_pictures', // Dossier par défaut dans Cloudinary
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folder }, // Spécifiez le dossier dans Cloudinary
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('Cloudinary upload result is undefined.')); // <-- AJOUTÉ : Vérification de result
          resolve(result.secure_url); // Retourne l'URL sécurisée de l'image
        },
      );
      toStream(file.buffer).pipe(uploadStream); // Convertit le buffer du fichier en stream et l'envoie à Cloudinary
    });
  }
}
