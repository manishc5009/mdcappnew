import { Model, DataTypes, Op } from 'sequelize';
import { sequelize } from '../db/index.js';

class AuthToken extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    }
}

AuthToken.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        index: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => {
            const date = new Date();
            date.setHours(date.getHours() + 1); // Default 1 hour expiration
            return date;
        },
    },
}, {
    sequelize,
    modelName: 'AuthToken',
    tableName: 'auth_tokens',
    timestamps: false,
    indexes: [
        {
            name: 'idx_auth_tokens_token',
            unique: true,
            fields: ['token']
        },
        {
            name: 'idx_auth_tokens_expires',
            fields: ['expiresAt']
        }
    ]
});

// Static method to cleanup expired tokens
AuthToken.cleanupExpired = async function() {
    return this.destroy({
        where: {
            expiresAt: {
                [Op.lt]: new Date()
            }
        }
    });
};

export default AuthToken;