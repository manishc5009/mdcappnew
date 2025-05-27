import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

class Organization extends Model {
    static associate(models) {
        this.belongsToMany(models.User, {
            through: models.UserOrganization,
            as: 'users',
            foreignKey: 'organizationId'
        });
    }
}

Organization.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
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
    modelName: 'Organization',
    tableName: 'organizations'
});

export default Organization;