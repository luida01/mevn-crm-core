import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from './models/Customer';
import Manga from './models/Manga';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mevn-crm';

const customers = [
    {
        firstName: 'Juan',
        lastName: 'Perez',
        email: 'juan.perez@example.com',
        phone: '555-0101',
        address: { street: '', city: '', zip: '' }
    },
    {
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@example.com',
        phone: '555-0102',
        address: { street: '', city: '', zip: '' }
    },
    {
        firstName: 'Carlos',
        lastName: 'Lopez',
        email: 'carlos.lopez@example.com',
        phone: '555-0103',
        address: { street: '', city: '', zip: '' }
    }
];

const mangas = [
    {
        title: 'One Piece',
        volume: 1,
        author: 'Eiichiro Oda',
        genre: 'Action, Adventure, Shounen',
        price: 15,
        rentalPrice: 2,
        stock: 10,
        description: 'The beginning of the great pirate era.',
        coverImage: 'https://cdn.myanimelist.net/images/manga/3/55539.jpg',
        malScore: 9.2
    },
    {
        title: 'Naruto',
        volume: 1,
        author: 'Masashi Kishimoto',
        genre: 'Action, Adventure, Shounen',
        price: 12,
        rentalPrice: 1.5,
        stock: 5,
        description: 'A ninja who wants to become Hokage.',
        coverImage: 'https://cdn.myanimelist.net/images/manga/3/117681.jpg',
        malScore: 8.1
    },
    {
        title: 'Attack on Titan',
        volume: 1,
        author: 'Hajime Isayama',
        genre: 'Action, Drama, Seinen',
        price: 18,
        rentalPrice: 2.5,
        stock: 8,
        description: 'Humanity fights against titans.',
        coverImage: 'https://cdn.myanimelist.net/images/manga/2/178430.jpg',
        malScore: 8.6
    }
];

const seedData = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });

        const customerResults = await Customer.bulkWrite(customers.map((customer) => ({
            updateOne: {
                filter: { email: customer.email },
                update: { $setOnInsert: customer },
                upsert: true
            }
        })));

        const mangaResults = await Manga.bulkWrite(mangas.map((manga) => ({
            updateOne: {
                filter: { title: manga.title, volume: manga.volume },
                update: { $setOnInsert: manga },
                upsert: true
            }
        })));

        console.log(
            `Demo seed complete. Added ${customerResults.upsertedCount} customers and ${mangaResults.upsertedCount} manga volumes; existing records were preserved.`
        );
    } catch (error: unknown) {
        console.error('Error seeding database:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

void seedData();
