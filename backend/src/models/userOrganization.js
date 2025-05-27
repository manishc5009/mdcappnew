import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

class UserOrganization extends Model {
    static associate(models) {
        // Associations are defined in User and Organization models
    }
}

UserOrganization.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'organizations',
            key: 'id'
        }
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'member'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'UserOrganization',
    tableName: 'user_organizations',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'organizationId']
        }
    ]
});

export default UserOrganization;