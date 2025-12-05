import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from './models/Customer';
import Manga from './models/Manga';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mevn-crm';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        // Clear existing data
        await Customer.deleteMany({});
        await Manga.deleteMany({});
        console.log('Cleared existing data');

        // Seed Customers
        const customers = [
            {
                name: 'Juan Perez',
                email: 'juan.perez@example.com',
                phone: '555-0101',
                status: 'prospect',
                notes: 'Interested in Shonen manga'
            },
            {
                name: 'Maria Garcia',
                email: 'maria.garcia@example.com',
                phone: '555-0102',
                status: 'lead',
                notes: 'Looking for Shojo titles'
            },
            {
                name: 'Carlos Lopez',
                email: 'carlos.lopez@example.com',
                phone: '555-0103',
                status: 'closed',
                notes: 'Regular customer'
            }
        ];

        await Customer.insertMany(customers);
        console.log('Seeded customers');

        // Seed Mangas
        const mangas = [
            {
                title: 'One Piece',
                volume: 1,
                author: 'Eiichiro Oda',
                genre: 'Shonen',
                price: 15.00,
                rentalPrice: 2.00,
                stock: 10,
                description: 'The beginning of the great pirate era.',
                coverImage: 'https://cdn.myanimelist.net/images/manga/3/55539.jpg'
            },
            {
                title: 'Naruto',
                volume: 1,
                author: 'Masashi Kishimoto',
                genre: 'Shonen',
                price: 12.00,
                rentalPrice: 1.50,
                stock: 5,
                description: 'A ninja who wants to become Hokage.',
                coverImage: 'https://cdn.myanimelist.net/images/manga/3/117681.jpg'
            },
            {
                title: 'Attack on Titan',
                volume: 1,
                author: 'Hajime Isayama',
                genre: 'Seinen',
                price: 18.00,
                rentalPrice: 2.50,
                stock: 8,
                description: 'Humanity fights against titans.',
                coverImage: 'https://cdn.myanimelist.net/images/manga/2/178430.jpg'
            }
        ];

        await Manga.insertMany(mangas);
        console.log('Seeded mangas');

        console.log('Database seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
