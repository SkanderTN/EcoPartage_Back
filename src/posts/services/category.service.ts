import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultCategories();
  }

  private async seedDefaultCategories() {
    const defaultCategories = [
      { name: 'Alimentation', description: 'Nourriture, boissons et produits alimentaires' },
      { name: 'Vêtements', description: 'Vêtements et accessoires de mode' },
      { name: 'Électronique', description: 'Appareils électroniques et technologie' },
      { name: 'Mobilier', description: 'Meubles et équipements pour la maison' },
      { name: 'Matériaux', description: 'Matériaux de construction et bricolage' },
      { name: 'Livres', description: 'Livres, magazines et publications' },
      { name: 'Jouets', description: 'Jouets et jeux pour enfants' },
      { name: 'Sport', description: 'Équipements et articles de sport' },
      { name: 'Jardinage', description: 'Plantes, outils et matériel de jardinage' },
      { name: 'Autre', description: 'Autres articles divers' },
    ];

    for (const categoryData of defaultCategories) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: categoryData.name }
      });

      if (!existingCategory) {
        const category = this.categoryRepository.create({
          ...categoryData,
          isDefault: true,
        });
        await this.categoryRepository.save(category);
      }
    }
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Category | null> {
    return this.categoryRepository.findOne({
      where: { id }
    });
  }

  async create(name: string, description?: string): Promise<Category> {
    const category = this.categoryRepository.create({
      name,
      description,
      isDefault: false,
    });
    return this.categoryRepository.save(category);
  }

  async delete(id: string): Promise<void> {
    const category = await this.findOne(id);
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Prevent deletion of default categories
    if (category.isDefault) {
      throw new Error('Cannot delete default categories');
    }

    await this.categoryRepository.delete(id);
  }
}