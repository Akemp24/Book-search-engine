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
            // create login logic
        },
        addUser: async (_, { args }) => {
            // create user registration logic
        },
        saveBook: async (_, { input }, context) => {
            // logic to save book to users saved books
        },
        removeBook: async(_, { bookId }, context) => {
            // logic to remove book from users saved books
        },
    },
};

module.exports = resolvers;