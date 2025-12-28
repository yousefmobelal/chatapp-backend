import { User } from '@/types/user';
import { DataTypes, Model, type Optional } from 'sequelize';
import { sequelize } from '@/config/sequelize';

export type UserCreationAttributes = Optional<User, 'id' | 'createdAt' | 'updatedAt'>;

export class UserModel extends Model<User, UserCreationAttributes> implements User {
  declare email: string;
  declare displayName: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare id: string;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
  },
);
