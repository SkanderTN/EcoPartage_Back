// Backend/src/posts/dto/post-response.dto.ts
import { Post } from '../entities/post.entity';

// Ce DTO étend l'entité Post et ajoute la propriété userName
// Il représente la forme des données que le backend enverra au frontend
export class PostResponseDto extends Post {
  userName?: string; // Le nom de l'utilisateur qui sera ajouté par le service
}

// DTO pour la réponse paginée des posts
export class PostsResponseDto {
  data: PostResponseDto[];
  total: number;
  page: number;
  limit: number;
}
