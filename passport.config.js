const User = require('./models/User.model');
const bcrypt = require('bcryptjs');

const LocalStrategy = require('passport-local').Strategy;
const InitializePassport = (passport) => {
    const authenticateUser = async (inst_id, password, done) => {
        try {
            // check if user exists
            const user = await User.findOne({ inst_id });
            if (!user)
                return done(null, false, {
                    message: 'Invalid ID or password.',
                });

            // check if password is correct
            if (await bcrypt.compare(password, user.password))
                return done(null, user);
            else
                return done(null, false, {
                    message: 'Invalid ID or password.',
                });
        } catch (error) {
            done(error);
        }
    };

    passport.use(
        new LocalStrategy({ usernameField: 'inst_id' }, authenticateUser)
    );
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    });
};
module.exports = InitializePassport;
