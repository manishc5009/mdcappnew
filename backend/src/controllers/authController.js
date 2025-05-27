import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as db from '../db/index.js';
import process from 'process';

const User = db.User;
const AuthToken = db.AuthToken;

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '1h';

export default class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered.' });
      }

      // Remove manual hashing, rely on model hook
      const user = await User.create({ username, email, password });
      console.log('User created:', user);
      console.log('Stored password hash after creation:', user.password);

      return res.status(201).json({ message: 'User registered successfully.', user: { id: user.id, username, email } });
    } catch (error) {
      return res.status(500).json({ message: 'Registration failed.', error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      // Optionally, store token in AuthToken table
      await AuthToken.create({ userId: user.id, token });

      return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      return res.status(500).json({ message: 'Login failed.', error: error.message });
    }
  }

  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: 'Token required.' });
      }

      // Remove token from AuthToken table
      await AuthToken.destroy({ where: { token } });

      return res.json({ message: 'Logged out successfully.' });
    } catch (error) {
      return res.status(500).json({ message: 'Logout failed.', error: error.message });
    }
  }

  async refreshToken(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: 'Token required.' });
      }

      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid token.' });
        }
        const newToken = jwt.sign({ id: decoded.id, email: decoded.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.json({ token: newToken });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Token refresh failed.', error: error.message });
    }
  }
}