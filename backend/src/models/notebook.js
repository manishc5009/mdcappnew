import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

class Notebook extends Model {}

Notebook.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    taskId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    selectedOption: {
        type: DataTypes.STRING,
        allowNull: false
    },
    selectedDataId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currentStep: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    uploadCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filesize: {
        type: DataTypes.STRING,
        allowNull: true
    },
    total_rows: {
        type: DataTypes.INTEGER,
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
    modelName: 'Notebook',
    tableName: 'notebooks'
});

export default Notebook;
