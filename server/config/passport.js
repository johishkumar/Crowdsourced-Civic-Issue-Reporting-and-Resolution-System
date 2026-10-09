const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple');
const User = require('../models/User');

// ─── Google Strategy ───────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) return done(null, user);

          // Check if email already registered
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
              // Link Google to existing account
              user.googleId = profile.id;
              user.profileImage = user.profileImage || profile.photos?.[0]?.value;
              await user.save({ validateBeforeSave: false });
              return done(null, user);
            }
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || 'Google User',
            email: email ? email.toLowerCase() : undefined,
            profileImage: profile.photos?.[0]?.value || '',
            provider: 'google',
            isVerified: true,
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  Google OAuth credentials not found. Google login disabled.');
}

// ─── Apple Strategy ────────────────────────────────────────────
if (
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY
) {
  passport.use(
    new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        callbackURL: `${process.env.CLIENT_URL}/api/auth/apple/callback`,
        scope: ['name', 'email'],
      },
      async (accessToken, refreshToken, idToken, profile, done) => {
        try {
          const appleId = profile.id || idToken?.sub;
          const email = profile.email || idToken?.email;

          let user = await User.findOne({ appleId });
          if (user) return done(null, user);

          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
              user.appleId = appleId;
              await user.save({ validateBeforeSave: false });
              return done(null, user);
            }
          }

          user = await User.create({
            appleId,
            name: profile.name?.firstName
              ? `${profile.name.firstName} ${profile.name.lastName || ''}`.trim()
              : 'Apple User',
            email: email ? email.toLowerCase() : undefined,
            provider: 'apple',
            isVerified: true,
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  Apple Sign-In credentials not found. Apple login disabled.');
}

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
