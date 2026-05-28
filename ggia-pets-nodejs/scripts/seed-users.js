const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Connect to database
require('../config/database');

const UserModel = require('../models/user.model');
const { userType: USER_TYPES } = require('../helpers/constants');

const SEED_PASSWORD = 'secret@123';

async function seedUsers() {
    try {
        console.log('🌱 Starting user seeding...');

        // Clear existing users? (Optional, let's just append for now to be safe, or clear if user prefers)
        // await UserModel.deleteMany({});

        const usersToCreate = [];

        // Create 2 Groomers
        for (let i = 0; i < 2; i++) {
            usersToCreate.push({
                userType: USER_TYPES.GROOMER,
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: SEED_PASSWORD,
                phone: faker.phone.number(),
                country: 'USA'
            });
        }

        // Create 2 Daycares
        for (let i = 0; i < 2; i++) {
            usersToCreate.push({
                userType: USER_TYPES.DAYCARE,
                name: faker.person.fullName(),
                email: faker.internet.email().toLowerCase(),
                password: SEED_PASSWORD,
                phone: faker.phone.number(),
                country: 'USA'
            });
        }


        console.log(`Inserting ${usersToCreate.length} users...`);

        // Using save() individually to trigger 'pre-save' hooks for password hashing
        for (const userData of usersToCreate) {
            const user = new UserModel(userData);
            // await user.save(); // save is called inside generateToken
            const token = await user.generateToken();
            console.log(`Created ${userData.userType === 1 ? 'Pet Owner' : userData.userType === 2 ? 'Groomer' : 'Daycare'}: ${userData.email}`);
            console.log(`Token: ${token}`);
        }

        console.log('✅ User seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
}

seedUsers();
