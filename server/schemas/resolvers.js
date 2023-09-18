// import required dependencies
const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');

const resolvers = {
    Query: {
        me: async (_, __, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id });
                return userData;
            }
            throw new AuthenticationError('Not logged in');
        },
    },

    Mutation: {
        login: async (_, { email, password }) => {
            try {
                // find by email
                const user = await User.findOne({ email});

                // if no user found
                if (!user || !user.isCorrectPassword(password)) {
                    throw new AuthenticationError('Invalid user or password');
                }
                // if correct
                const token = signToken(user);

                return { token, user };
            } catch (err) {
                console.error(err);
                throw new AuthenticationError('Something went wrong with the login');
            }
        },
        addUser: async (_, { args }) => {
            try {
                // Check if a user with the provided email already exists
                const existingUser = await User.findOne({ email });

                // If a user with the email exists, throw an authentication error
                if (existingUser) {
                    throw new AuthenticationError('Email is already in use');
                }

                // Hash the password
                const hashedPassword = await User.hashPassword(password);

                // Create a new user record
                const newUser = await User.create({
                    username,
                    email,
                    password: hashedPassword,
                });

                // Sign a JWT token for the new user
                const token = signToken(newUser);

                // Return the token and user data
                return { token, user: newUser };
            } catch (err) {
                console.error(err);
                throw new AuthenticationError('Error creating a new user');
            }
        },
        saveBook: async (_, { input }, context) => {
            try {
                // Check if the user is authenticated
                if (!context.user) {
                    throw new AuthenticationError('You need to be logged in to save books.');
                }

                // Find the user by their ID
                const user = await User.findOne({ _id: context.user._id });

                // Check if the book is already in the user's saved books
                if (user.savedBooks.some((book) => book.bookId === input.bookId)) {
                    return user; // Book is already saved, so return the user as-is
                }

                // Add the book to the user's saved books
                user.savedBooks.push(input);

                // Save the updated user document
                await user.save();

                return user; // Return the updated user data
            } catch (err) {
                console.error(err);
                throw new AuthenticationError('Error saving the book.');
            }
        },
        removeBook: async(_, { bookId }, context) => {
            try {
                // Check if the user is authenticated
                if (!context.user) {
                    throw new AuthenticationError('You need to be logged in to remove books.');
                }

                // Find the user by their ID
                const user = await User.findOne({ _id: context.user._id });

                // Filter out the book with the specified bookId from savedBooks array
                user.savedBooks = user.savedBooks.filter((book) => book.bookId !== bookId);

                // Save the updated user document
                await user.save();

                return user; // Return the updated user data
            } catch (err) {
                console.error(err);
                throw new AuthenticationError('Error removing the book.');
            }
        },
    },
};

module.exports = resolvers;