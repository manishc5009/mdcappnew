import * as db from '../db/index.js';
import bcrypt from 'bcryptjs';

const User = db.User;

class UserController {
    async createUser(req, res) {
        try {
            const { fullName, email, password, company, phone } = req.body;
            if (!fullName || !email || !password) {
                return res.status(400).json({ message: 'All fields are required.' });
            }
            const username = email.split('@')[0];

            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ message: 'Email already registered.' });
            }

            // Remove manual hashing, rely on model hook
            const user = await User.create({ fullName, username, email, password, company, phone });

            return res.status(201).json({ message: 'User created successfully.', user: { id: user.id, fullName, username, email, company, phone } });
        } catch (error) {
            return res.status(500).json({ message: 'User creation failed.', error: error.message });
        }
    }

    async getUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            return res.json(user);
        } catch (error) {
            return res.status(500).json({ message: 'Failed to retrieve user.', error: error.message });
        }
    }

    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { fullName, username, email, password, company, phone } = req.body;
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }

            if (fullName) user.fullName = fullName;
            if (username) user.username = username;
            if (email) user.email = email;
            if (password) user.password = password;
            if (company) user.company = company;
            if (phone) user.phone = phone;

            await user.save();

            return res.json({ message: 'User updated successfully.', user: { id: user.id, fullName: user.fullName, username: user.username, email: user.email, company: user.company, phone: user.phone } });
        } catch (error) {
            return res.status(500).json({ message: 'User update failed.', error: error.message });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            await user.destroy();
            return res.json({ message: 'User deleted successfully.' });
        } catch (error) {
            return res.status(500).json({ message: 'User deletion failed.', error: error.message });
        }
    }

    async changePassword(req, res) {
        try {
            console.log('User from req.user:', req.user);
            const userId = req.user?.id || req.params.id;
            console.log('User ID used for password change:', userId);
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Current and new passwords are required.' });
            }

            const user = await User.findByPk(userId);
            if (!user) {
                console.log('User not found with ID:', userId);
                return res.status(404).json({ message: 'User not found.' });
            }

            const passwordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordMatch) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }

            user.password = newPassword; // model hook will hash
            await user.save();

            return res.json({ message: 'Password changed successfully.' });
        } catch (error) {
            console.error('Error in changePassword:', error);
            return res.status(500).json({ message: 'Password change failed.', error: error.message });
        }
    }
}

export default UserController;
